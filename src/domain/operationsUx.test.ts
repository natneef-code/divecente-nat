import { describe, expect, it } from "vitest";
import { actorFor } from "./model";
import { createBooking } from "./commands";
import { seed } from "./seed";
import {
  addManifestGroup,
  applySeatSuggestions,
  assignManifestSeat,
  bulkCreateEquipment,
  dailyCoverage,
  equipmentSummary,
  manifestFor,
  manifestOccupants,
  setBoatSeatUnavailable,
  suggestConsecutiveSeats,
  updateBoatCapacity,
} from "./operationsUx";

const customer = actorFor("customer");
const desk = actorFor("frontdesk");
const manager = actorFor("manager");
const instructor = actorFor("instructor");

function booked(count = 2) {
  const initial = seed(new Date("2026-09-14T04:00:00Z"));
  const activity = initial.activities.find(
    (row) => row.courseId === "open-water",
  )!;
  const result = createBooking(initial, customer, {
    activityId: activity.id,
    participants: Array.from({ length: count }, (_, index) => ({
      name: `Diver ${index + 1}`,
      equipment: "Included core set",
    })),
    documents: true,
    terms: true,
    prerequisites: true,
    method: "QR",
  });
  return { state: result.state, activity, bookingId: result.id };
}

describe("operational UX domain", () => {
  it("bulk creates a large uniquely tracked inventory and summarizes operational states", () => {
    const initial = seed();
    const next = bulkCreateEquipment(initial, manager, {
      category: "BCD",
      size: "M",
      brand: "Demo",
      model: "Fleet",
      prefix: "BCD-M",
      start: 1,
      count: 100,
    });
    const created = next.equipmentItems.filter((row) =>
      row.id.startsWith("BCD-M-"),
    );
    expect(created).toHaveLength(100);
    expect(new Set(created.map((row) => row.id)).size).toBe(100);
    expect(equipmentSummary(next, "BCD", "M").total).toBeGreaterThanOrEqual(
      100,
    );
    expect(() =>
      bulkCreateEquipment(next, manager, {
        category: "BCD",
        size: "M",
        brand: "Demo",
        model: "Fleet",
        prefix: "BCD-M",
        start: 1,
        count: 2,
      }),
    ).toThrow(/already exist/i);
    expect(() =>
      bulkCreateEquipment(initial, desk, {
        category: "BCD",
        size: "M",
        brand: "Demo",
        model: "Fleet",
        prefix: "BCD-X",
        start: 1,
        count: 2,
      }),
    ).toThrow(/Manager/i);
  });

  it("keeps ten-plus staff distinguishable and calculates coverage per session", () => {
    const state = seed(new Date("2026-09-14T04:00:00Z"));
    expect(state.staffMembers.length).toBeGreaterThanOrEqual(10);
    expect(
      new Set(state.staffMembers.map((row) => row.employmentType)),
    ).toEqual(new Set(["Permanent", "Part-time", "Freelance"]));
    const activity = state.activities.find(
      (row) => row.courseId === "open-water",
    )!;
    const coverage = dailyCoverage(state, activity.id);
    expect(coverage.length).toBeGreaterThan(1);
    expect(
      coverage.every((row) => row.session.activityId === activity.id),
    ).toBe(true);
  });

  it("requires assistance above four and blocks an in-water course without Instructor", () => {
    const { state, activity } = booked(4);
    const extra = structuredClone(state.bookings[0].participants[0]);
    extra.id = "fifth-diver";
    state.bookings[0].participants.push(extra);
    activity.professionalIds = ["divemaster-dao"];
    activity.leadId = "divemaster-dao";
    const current = state.activities.find((row) => row.id === activity.id)!;
    current.professionalIds = ["divemaster-dao"];
    current.leadId = "divemaster-dao";
    const coverage = dailyCoverage(state, activity.id);
    expect(coverage.some((row) => row.missing > 0)).toBe(true);
    expect(
      coverage.some((row) =>
        row.issues.some((issue) => /Instructor/i.test(issue)),
      ),
    ).toBe(true);
    expect(coverage.some((row) => row.status === "Blocked")).toBe(true);
  });

  it("supports configurable 36-seat boats and rejects invalid, duplicate and blocked seats", () => {
    let { state, activity, bookingId } = booked(2);
    state = updateBoatCapacity(state, manager, activity.boatId!, 36);
    state = addManifestGroup(
      state,
      desk,
      activity.id,
      activity.boatId!,
      bookingId,
    );
    const manifest = manifestFor(state, activity.id, activity.boatId);
    const people = manifestOccupants(state, manifest);
    expect(() =>
      updateBoatCapacity(state, manager, activity.boatId!, 2),
    ).toThrow(/occupancy/i);
    state = assignManifestSeat(state, desk, manifest.id, people[0].id, 36);
    expect(manifestFor(state, activity.id, activity.boatId).seats[0].seat).toBe(
      36,
    );
    expect(() =>
      assignManifestSeat(state, desk, manifest.id, people[1].id, 36),
    ).toThrow(/already assigned/i);
    expect(() =>
      assignManifestSeat(state, desk, manifest.id, people[1].id, 37),
    ).toThrow(/between 1 and 36/i);
    state = setBoatSeatUnavailable(state, desk, activity.boatId!, 35, true);
    expect(() =>
      assignManifestSeat(state, desk, manifest.id, people[1].id, 35),
    ).toThrow(/unavailable/i);
  });

  it("keeps confirmed seats while suggesting consecutive group seats", () => {
    let { state, activity, bookingId } = booked(3);
    state = addManifestGroup(
      state,
      manager,
      activity.id,
      activity.boatId!,
      bookingId,
    );
    const manifest = manifestFor(state, activity.id, activity.boatId);
    const booking = state.bookings.find((row) => row.id === bookingId)!;
    state = assignManifestSeat(
      state,
      manager,
      manifest.id,
      booking.participants[0].id,
      5,
    );
    const current = manifestFor(state, activity.id, activity.boatId);
    const suggestions = suggestConsecutiveSeats(state, current, bookingId);
    expect(suggestions.map((row) => row.seat)).toEqual([1, 2]);
    state = applySeatSuggestions(state, manager, current.id, bookingId);
    expect(
      manifestFor(state, activity.id, activity.boatId).seats.find(
        (row) => row.occupantId === booking.participants[0].id,
      )?.seat,
    ).toBe(5);
  });

  it("allows Front Desk and Manager manifest edits, denies professionals and audits changes", () => {
    const setup = booked(1);
    let state = addManifestGroup(
      setup.state,
      desk,
      setup.activity.id,
      setup.activity.boatId!,
      setup.bookingId,
    );
    const manifest = manifestFor(
      state,
      setup.activity.id,
      setup.activity.boatId,
    );
    const person = state.bookings[0].participants[0];
    state = assignManifestSeat(state, manager, manifest.id, person.id, 1);
    expect(state.events.some((row) => /Seat 1/.test(row.action))).toBe(true);
    expect(() =>
      assignManifestSeat(state, instructor, manifest.id, person.id, 2),
    ).toThrow(/Permission denied/i);
    expect(() =>
      assignManifestSeat(state, customer, manifest.id, person.id, 2),
    ).toThrow(/Permission denied/i);
  });
});
