import { syncBookingRecords } from "./records";
import {
  bangkokDate,
  type Actor,
  type Booking,
  type Status,
  type Store,
} from "./model";
const terminal: Status[] = ["Cancelled", "Refunded", "No-show"];
export const reserved = (s: Store, activityId: string) =>
  s.bookings
    .filter((b) => b.activityId === activityId && !terminal.includes(b.status))
    .reduce((n, b) => n + b.participants.length, 0);
export const paid = (s: Store, bookingId: string) =>
  s.payments
    .filter((p) => p.bookingId === bookingId && p.status === "Approved")
    .reduce((n, p) => n + p.amount, 0);
export const balance = (s: Store, b: Booking) => b.total - paid(s, b.id);
export const staff = (a: Actor | null) =>
  a?.role === "frontdesk" || a?.role === "manager";
export function canRead(s: Store, a: Actor, b: Booking) {
  return (
    staff(a) ||
    (a.role === "customer" && b.customerId === a.customerId) ||
    (a.role === "instructor" &&
      s.activities.find((x) => x.id === b.activityId)?.instructorId === a.id)
  );
}
export function quote(
  price: number,
  count: number,
  computers: number,
  bps: number,
) {
  if (
    ![price, count, computers, bps].every(Number.isSafeInteger) ||
    price < 0 ||
    count < 1 ||
    count > 4 ||
    computers < 0 ||
    computers > count ||
    bps < 0 ||
    bps > 10000
  )
    throw new Error("Invalid booking price or participant count.");
  const total = price * count + 25000 * computers;
  if (!Number.isSafeInteger(total))
    throw new Error("Booking total is too large.");
  return { total, deposit: Math.round((total * bps) / 10000) };
}
export const event = (s: Store, a: Actor, id: string, action: string) =>
  s.events.unshift({
    id: crypto.randomUUID(),
    actorId: a.id,
    entityId: id,
    action,
    at: new Date().toISOString(),
  });
export function setStatus(b: Booking, status: Status) {
  b.status = status;
  b.updatedAt = new Date().toISOString();
  b.history.push({ status, at: b.updatedAt });
}
export type BookingInput = {
  customerId?: string;
  activityId: string;
  participants: { name: string; size: string; computer: boolean }[];
  documents: boolean;
  terms: boolean;
  prerequisites: boolean;
  method: "QR" | "Wise";
};
export function createBooking(
  source: Store,
  a: Actor,
  input: BookingInput,
): { state: Store; id: string } {
  const ownerId = staff(a)
    ? input.customerId
    : a.role === "customer"
      ? a.customerId
      : undefined;
  if (!ownerId || !source.customers.some((c) => c.id === ownerId))
    throw new Error("Permission denied: choose the customer demo to book.");
  const activity = source.activities.find((x) => x.id === input.activityId);
  const course = source.courses.find((x) => x.id === activity?.courseId);
  if (!activity || !course?.published || activity.date < bangkokDate())
    throw new Error("This activity is not available.");
  if (!input.terms || !input.prerequisites)
    throw new Error(
      "Accept the terms and review prerequisites before booking.",
    );
  if (!["QR", "Wise"].includes(input.method))
    throw new Error("Choose a valid payment method.");
  if (
    input.participants.some(
      (p) =>
        p.name.trim().length < 2 ||
        p.name.trim().length > 80 ||
        !["XS", "S", "M", "L", "XL", "XXL"].includes(p.size),
    )
  )
    throw new Error(
      "Enter each participant’s name (2–80 characters) and equipment size.",
    );
  const price = quote(
    course.price,
    input.participants.length,
    input.participants.filter((p) => p.computer).length,
    course.depositBps,
  );
  if (
    reserved(source, activity.id) + input.participants.length >
    Math.min(4, course.capacity, activity.capacity)
  )
    throw new Error(
      "Not enough places remain. Maximum class size is four students; choose another date.",
    );
  const s = structuredClone(source);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  s.bookings.unshift({
    id,
    customerId: ownerId,
    activityId: activity.id,
    participants: input.participants.map((p) => ({
      id: crypto.randomUUID(),
      name: p.name.trim(),
      size: p.size,
      equipment: p.computer ? "Set + computer" : "Included set",
      documents: input.documents ? "Submitted" : "Not started",
      medical: input.documents ? "Submitted" : "Not started",
      createdAt: now,
    })),
    status: "Awaiting payment",
    ...price,
    method: input.method,
    termsVersion: "demo-v1",
    prerequisitesAccepted: true,
    createdAt: now,
    updatedAt: now,
    history: [{ status: "Awaiting payment", at: now }],
  });
  syncBookingRecords(s, s.bookings[0]);
  event(s, a, id, "Booking created");
  return { state: s, id };
}
export function submitPayment(source: Store, a: Actor, id: string): Store {
  const s = structuredClone(source);
  const b = s.bookings.find((b) => b.id === id);
  if (!b || a.role !== "customer" || b.customerId !== a.customerId)
    throw new Error("Permission denied.");
  if (
    b.status !== "Awaiting payment" ||
    s.payments.some((p) => p.bookingId === id && p.status !== "Rejected")
  )
    throw new Error("This deposit has already been submitted.");
  const now = new Date().toISOString();
  s.payments.push({
    id: crypto.randomUUID(),
    bookingId: id,
    amount: b.deposit,
    method: b.method,
    status: b.method === "QR" ? "Approved" : "Pending",
    reference: `DEMO-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: now,
    ...(b.method === "QR" ? { reviewedAt: now, reviewerId: a.id } : {}),
  });
  setStatus(b, b.method === "QR" ? "Deposit paid" : "Payment verification");
  event(
    s,
    a,
    id,
    b.method === "QR"
      ? "Simulated deposit received"
      : "Mock Wise proof submitted",
  );
  return s;
}
export function verifyPayment(
  source: Store,
  a: Actor,
  id: string,
  approve: boolean,
): Store {
  if (!staff(a))
    throw new Error(
      "Permission denied: only front desk or manager can verify payments.",
    );
  const s = structuredClone(source);
  const p = s.payments.find((p) => p.id === id);
  const b = s.bookings.find((b) => b.id === p?.bookingId);
  if (!p || !b || p.status !== "Pending" || b.status !== "Payment verification")
    throw new Error("This transfer is not pending verification.");
  p.status = approve ? "Approved" : "Rejected";
  p.reviewerId = a.id;
  p.reviewedAt = new Date().toISOString();
  setStatus(b, approve ? "Deposit paid" : "Awaiting payment");
  event(
    s,
    a,
    b.id,
    approve ? "Demo transfer approved" : "Demo transfer rejected",
  );
  return s;
}
export function advanceBooking(source: Store, a: Actor, id: string): Store {
  if (!staff(a)) throw new Error("Permission denied.");
  const s = structuredClone(source);
  const b = s.bookings.find((b) => b.id === id);
  if (!b || !["Deposit paid", "Confirmed"].includes(b.status))
    throw new Error("Booking cannot advance from this status.");
  if (
    b.status === "Confirmed" &&
    b.participants.some((p) => p.documents !== "Submitted")
  )
    throw new Error(
      "Submit all demo document acknowledgements before check-in.",
    );
  setStatus(b, b.status === "Deposit paid" ? "Confirmed" : "Checked in");
  event(s, a, id, `Booking ${b.status.toLowerCase()}`);
  return s;
}
export function submitDocuments(source: Store, a: Actor, id: string): Store {
  const s = structuredClone(source);
  const b = s.bookings.find((b) => b.id === id);
  if (!b || a.role !== "customer" || b.customerId !== a.customerId)
    throw new Error("Permission denied.");
  b.participants.forEach((p) => {
    p.documents = "Submitted";
    p.medical = "Submitted";
  });
  b.updatedAt = new Date().toISOString();
  s.documents
    .filter((d) => d.bookingId === id)
    .forEach((d) => {
      d.status = "Submitted";
      d.submittedAt = b.updatedAt;
      delete d.reviewerId;
      delete d.reviewedAt;
    });
  event(
    s,
    a,
    id,
    "Demo document acknowledgements submitted; review still required",
  );
  return s;
}
