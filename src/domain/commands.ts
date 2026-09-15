import {
  occupancy,
  hasAssignment,
  effectiveRules,
  staffingSummary,
  operationalReadiness,
  equipmentAvailability,
  priceBooking,
  type ParticipantInput,
  canEquip,
  assignedIds,
} from "./policies";
import { syncBookingRecords } from "./records";
import {
  bangkokDate,
  type Actor,
  type Booking,
  type Status,
  type Store,
} from "./model";
export const reserved = occupancy;
export const paid = (s: Store, bookingId: string) =>
  s.payments
    .filter((p) => p.bookingId === bookingId && p.status === "Approved")
    .reduce((n, p) => n + p.amount, 0);
export const balance = (s: Store, b: Booking) =>
  ["Cancelled", "Refunded"].includes(b.status) ? 0 : b.total - paid(s, b.id);
export const staff = (a: Actor | null) =>
  a?.role === "frontdesk" || a?.role === "manager";
export function canRead(s: Store, a: Actor, b: Booking) {
  return (
    staff(a) ||
    (a.role === "customer" && b.customerId === a.customerId) ||
    (["instructor", "divemaster"].includes(a.role) &&
      hasAssignment(s, a, b.activityId))
  );
}
export function quote(
  price: number,
  count: number,
  extraSatang: number,
  bps: number,
) {
  if (
    ![price, count, extraSatang, bps].every(Number.isSafeInteger) ||
    price < 0 ||
    count < 1 ||
    count > 100 ||
    extraSatang < 0 ||
    bps < 0 ||
    bps > 10000
  )
    throw new Error("Invalid booking price or participant count.");
  const total = price * count + extraSatang;
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
  participants: ParticipantInput[];
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
  const price = priceBooking(source, activity, input.participants);
  const capacity = Math.min(
    effectiveRules(source, activity).capacity,
    ...source.sessions
      .filter((x) => x.activityId === activity.id)
      .map((x) => effectiveRules(source, activity, x).capacity),
  );
  const projected = reserved(source, activity.id) + input.participants.length;
  if (projected > capacity)
    throw new Error(
      `Not enough places remain. Configured participant capacity is ${capacity}; choose another date.`,
    );
  const boat = source.boats.find((row) => row.id === activity.boatId);
  if (
    boat &&
    boat.name !== "Shore-based" &&
    projected + assignedIds(source, activity).length > boat.capacity
  )
    throw new Error(
      `Boat seating would be exceeded. ${boat.name} has ${boat.capacity} passenger and professional seats.`,
    );
  if (
    projected > source.settings.defaultStaffingRatio &&
    !staffingSummary(source, activity, undefined, projected).ready
  )
    throw new Error(
      "Additional qualified professionals must be assigned before reserving this larger group. Contact Front Desk.",
    );
  if (
    equipmentAvailability(source, activity, price.participants).some(
      (x) => x.missing,
    )
  )
    throw new Error(
      "Not enough included/rental equipment is available for the selected activity. Contact Front Desk.",
    );
  const s = structuredClone(source);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  s.bookings.unshift({
    id,
    customerId: ownerId,
    activityId: activity.id,
    participants: price.participants.map((p) => ({
      ...p,
      documents: input.documents
        ? ("Submitted" as const)
        : ("Not started" as const),
      medical: input.documents
        ? ("Submitted" as const)
        : ("Not started" as const),
    })),
    kind: course.kind || "course",
    lineItems: price.lines,
    status: "Awaiting payment",
    total: price.total,
    deposit: price.deposit,
    method: input.method,
    termsVersion: "demo-v1",
    prerequisitesAccepted: true,
    createdAt: now,
    updatedAt: now,
    history: [{ status: "Awaiting payment", at: now }],
  });
  s.activities.find((x) => x.id === activity.id)!.readinessStatus = "Draft";
  syncBookingRecords(s, s.bookings[0]);
  const manifest = s.boatManifests.find(
    (row) => row.activityId === activity.id && row.boatId === activity.boatId,
  );
  if (manifest && !manifest.bookingIds.includes(id)) {
    manifest.bookingIds.push(id);
    manifest.updatedAt = now;
  }
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
  const s = structuredClone(source);
  const b = s.bookings.find((b) => b.id === id);
  if (
    !b ||
    !(staff(a) || (b.status === "Confirmed" && canEquip(s, a, b.activityId)))
  )
    throw new Error("Permission denied.");
  if (!b || !["Deposit paid", "Confirmed"].includes(b.status))
    throw new Error("Booking cannot advance from this status.");
  if (
    b.status === "Confirmed" &&
    b.participants.some((p) => p.documents !== "Submitted")
  )
    throw new Error(
      "Submit all demo document acknowledgements before check-in.",
    );
  if (b.status === "Confirmed") {
    const readiness = operationalReadiness(
      s,
      s.activities.find((x) => x.id === b.activityId)!,
    );
    if (!readiness.ready)
      throw new Error(
        readiness.issues.join(" ") ||
          "Operational staffing requirements are not met.",
      );
    if (
      b.participants.some((p) =>
        ["Review required", "Expired"].includes(p.medical),
      )
    )
      throw new Error("Participant documents require operational review.");
  }
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
