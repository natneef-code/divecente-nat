import { describe, it, expect } from "vitest";
import { seed } from "./seed";
import { actorFor } from "./model";
import {
  quote,
  createBooking,
  submitPayment,
  verifyPayment,
  advanceBooking,
  paid,
  balance,
  canRead,
  submitDocuments,
  type BookingInput,
} from "./commands";
const customer = actorFor("customer");
const desk = actorFor("frontdesk");
const input = (method: "QR" | "Wise" = "QR", count = 1): BookingInput => ({
  activityId: "open-water-0",
  participants: Array.from({ length: count }, (_, i) => ({
    name: `Demo Diver ${i}`,
  })),
  documents: true,
  terms: true,
  prerequisites: true,
  method,
});
describe("booking vertical slice", () => {
  it("calculates course deposits and balances in satang", () => {
    for (const [price, deposit] of [
      [850000, 85000],
      [950000, 95000],
      [350000, 35000],
    ])
      expect(quote(price, 1, 0, 1000)).toEqual({ total: price, deposit });
    expect(quote(850000, 2, 25000, 1000)).toEqual({
      total: 1725000,
      deposit: 172500,
    });
  });
  it("connects booking, deposit, confirmation, and check-in", () => {
    let { state, id } = createBooking(seed(), customer, input());
    expect(state.bookings[0].status).toBe("Awaiting payment");
    state = submitPayment(state, customer, id);
    expect(paid(state, id)).toBe(85000);
    expect(balance(state, state.bookings[0])).toBe(765000);
    state = advanceBooking(state, desk, id);
    state = advanceBooking(state, desk, id);
    expect(state.bookings[0].status).toBe("Checked in");
    expect(state.bookings[0].history).toHaveLength(4);
    expect(state.events).toHaveLength(4);
  });
  it("limits aggregate capacity, not only each booking", () => {
    const { state } = createBooking(seed(), customer, input("QR", 3));
    expect(() => createBooking(state, customer, input("QR", 2))).toThrow(
      "Not enough places",
    );
    expect(createBooking(state, customer, input()).state.bookings).toHaveLength(
      2,
    );
  });
  it("rejects invalid and fractional counts and data", () => {
    for (const count of [0, 101, 1.5])
      expect(() => quote(850000, count, 0, 1000)).toThrow();
    expect(() =>
      createBooking(seed(), customer, { ...input(), terms: false }),
    ).toThrow();
    expect(() =>
      createBooking(seed(), customer, {
        ...input(),
        participants: [{ name: " " }],
      }),
    ).toThrow();
  });
  it("prevents duplicate deposits", () => {
    let { state, id } = createBooking(seed(), customer, input());
    state = submitPayment(state, customer, id);
    expect(() => submitPayment(state, customer, id)).toThrow("already");
    expect(state.payments).toHaveLength(1);
  });
  it("requires authorized Wise verification and supports rejection/resubmission", () => {
    let { state, id } = createBooking(seed(), customer, input("Wise"));
    state = submitPayment(state, customer, id);
    expect(paid(state, id)).toBe(0);
    expect(balance(state, state.bookings[0])).toBe(850000);
    expect(() =>
      verifyPayment(state, customer, state.payments[0].id, true),
    ).toThrow("Permission");
    state = verifyPayment(state, desk, state.payments[0].id, false);
    expect(state.bookings[0].status).toBe("Awaiting payment");
    state = submitPayment(state, customer, id);
    state = verifyPayment(state, desk, state.payments[1].id, true);
    expect(paid(state, id)).toBe(85000);
    expect(() =>
      verifyPayment(state, desk, state.payments[1].id, true),
    ).toThrow();
  });
  it("checks role and ownership for writes and reads", () => {
    const { state, id } = createBooking(seed(), customer, input());
    const stranger = { ...customer, customerId: "other" };
    expect(canRead(state, stranger, state.bookings[0])).toBe(false);
    expect(() => submitPayment(state, stranger, id)).toThrow();
    expect(() => createBooking(seed(), desk, input())).toThrow();
    expect(() => advanceBooking(state, actorFor("instructor"), id)).toThrow();
    expect(canRead(state, actorFor("instructor"), state.bookings[0])).toBe(
      true,
    );
    expect(
      canRead(state, { role: "instructor", id: "other" }, state.bookings[0]),
    ).toBe(false);
  });
  it("does not mutate source and blocks check-in with missing acknowledgements", () => {
    const source = seed();
    let { state, id } = createBooking(source, customer, {
      ...input(),
      documents: false,
    });
    expect(source.bookings).toHaveLength(0);
    state = submitPayment(state, customer, id);
    state = advanceBooking(state, desk, id);
    expect(() => advanceBooking(state, desk, id)).toThrow(
      "document acknowledgements",
    );
    state = submitDocuments(state, customer, id);
    expect(advanceBooking(state, desk, id).bookings[0].status).toBe(
      "Checked in",
    );
  });
  it("rejects past activities and unavailable courses", () => {
    const s = seed();
    s.activities[0].date = "2000-01-01";
    expect(() => createBooking(s, customer, input())).toThrow("not available");
    s.activities[0].date = "2099-01-01";
    s.courses[0].published = false;
    expect(() => createBooking(s, customer, input())).toThrow("not available");
  });
});
