import {
  type Store,
  type Actor,
  type Customer,
  type Course,
  type Activity,
  type StaffMember,
  type EquipmentItem,
  type TrainingStatus,
  trainingStates,
  bangkokDate,
} from "./model";
import { staff, event, setStatus, paid, balance, reserved } from "./commands";
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const requireStaff = (a: Actor) => {
  if (!staff(a)) throw new Error("Permission denied: staff access required.");
};
const requireManager = (a: Actor) => {
  if (a.role !== "manager")
    throw new Error("Permission denied: manager access required.");
};
const clean = (value: string, max = 2000) => value.trim().slice(0, max);
const validDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
export const overlaps = (a: Activity, b: Activity) =>
  a.date <= b.endDate && b.date <= a.endDate;
export const staffName = (s: Store, key: string | null) =>
  s.staffMembers.find((p) => p.id === key)?.name || "Unassigned";
export function notify(
  s: Store,
  actor: Actor,
  entityId: string,
  type: string,
  message: string,
) {
  const b = s.bookings.find((b) => b.id === entityId);
  s.notifications.unshift({
    id: id(),
    bookingId: b?.id,
    customerId: b?.customerId,
    type,
    message,
    channels: ["Internal", ...s.settings.channels],
    createdAt: now(),
    read: false,
    simulated: true,
  });
  event(s, actor, entityId, type);
}
export function saveCustomer(
  source: Store,
  a: Actor,
  input: Partial<Customer> & { name: string; email: string },
): Store {
  if (!staff(a) && !(a.role === "customer" && input.id === a.customerId))
    throw new Error("Permission denied.");
  if (input.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(input.email))
    throw new Error("Enter a name and valid fictional email.");
  if (!Number.isInteger(input.loggedDives || 0) || (input.loggedDives || 0) < 0)
    throw new Error("Logged dives must be a non-negative whole number.");
  for (const date of [input.dateOfBirth, input.lastDive])
    if (date && (!validDate(date) || date > bangkokDate()))
      throw new Error("Profile dates must be valid and not in the future.");
  if (
    source.customers.some(
      (c) =>
        c.email.toLowerCase() === input.email.toLowerCase() &&
        c.id !== input.id,
    )
  )
    throw new Error("A customer with that email already exists.");
  const s = structuredClone(source);
  const existing = s.customers.find((c) => c.id === input.id);
  if (input.id && !existing) throw new Error("Customer not found.");
  const record: Customer = {
    id: existing?.id || id(),
    name: clean(input.name, 80),
    email: clean(input.email, 120).toLowerCase(),
    certification: clean(input.certification || "New diver", 80),
    loggedDives: input.loggedDives || 0,
    createdAt: existing?.createdAt || now(),
    updatedAt: now(),
  };
  for (const field of [
    "preferredName",
    "phone",
    "dateOfBirth",
    "nationality",
    "language",
    "emergencyName",
    "emergencyPhone",
    "certificationOrg",
    "certificationNumber",
    "lastDive",
    "notes",
  ] as const)
    record[field] = clean(input[field] || "", field === "notes" ? 1000 : 120);
  if (existing) Object.assign(existing, record);
  else s.customers.push(record);
  event(s, a, record.id, "Customer profile saved");
  return s;
}
export function createEnquiry(
  source: Store,
  a: Actor,
  input: { name: string; email: string; courseId: string; message: string },
): Store {
  requireStaff(a);
  if (
    input.name.trim().length < 2 ||
    !/^\S+@\S+\.\S+$/.test(input.email) ||
    !source.courses.some((c) => c.id === input.courseId) ||
    !input.message.trim()
  )
    throw new Error("Complete the enquiry name, email, course and message.");
  const s = structuredClone(source);
  const key = id();
  s.enquiries.unshift({
    ...input,
    name: clean(input.name, 80),
    email: clean(input.email, 120).toLowerCase(),
    message: clean(input.message),
    id: key,
    status: "New",
    createdAt: now(),
    updatedAt: now(),
  });
  event(s, a, key, "Enquiry created");
  return s;
}
export function changeEnquiry(
  source: Store,
  a: Actor,
  key: string,
  status: "Contacted" | "Converted" | "Closed",
): Store {
  requireStaff(a);
  const s = structuredClone(source);
  const e = s.enquiries.find((e) => e.id === key);
  if (!e) throw new Error("Enquiry not found.");
  if (e.status === "Converted") throw new Error("Enquiry already converted.");
  if (status === "Converted") {
    const customer = s.customers.find(
      (c) => c.email.toLowerCase() === e.email.toLowerCase(),
    );
    e.customerId = customer?.id || id();
    if (!customer)
      s.customers.push({
        id: e.customerId,
        name: e.name,
        email: e.email,
        certification: "New diver",
        loggedDives: 0,
        createdAt: now(),
        updatedAt: now(),
      });
  }
  e.status = status;
  e.updatedAt = now();
  event(s, a, key, `Enquiry ${status.toLowerCase()}`);
  return s;
}
export function instructorIssue(
  s: Store,
  activity: Activity,
  personId: string,
): string | null {
  const person = s.staffMembers.find((p) => p.id === personId);
  if (!person?.active || person.role !== "instructor")
    return "Choose an active instructor.";
  if (
    !person.qualifiedCourseIds.includes(activity.courseId) ||
    person.qualificationExpiry < activity.endDate
  )
    return "Instructor qualification is missing or expires before this activity ends.";
  if (
    person.availableFrom > activity.date ||
    person.availableTo < activity.endDate
  )
    return "Instructor is unavailable for these dates.";
  if (
    s.activities.some(
      (x) =>
        x.id !== activity.id &&
        x.instructorId === personId &&
        overlaps(x, activity),
    )
  )
    return "Instructor schedule conflict: course blocks overlap.";
  return null;
}
export function assignInstructor(
  source: Store,
  a: Actor,
  activityId: string,
  personId: string | null,
): Store {
  requireStaff(a);
  const s = structuredClone(source);
  const activity = s.activities.find((x) => x.id === activityId);
  if (!activity) throw new Error("Activity not found.");
  if (personId) {
    const problem = instructorIssue(s, activity, personId);
    if (problem) throw new Error(problem);
  }
  activity.instructorId = personId;
  for (const b of s.bookings.filter((b) => b.activityId === activityId))
    notify(
      s,
      a,
      b.id,
      "Schedule change",
      `${staffName(s, personId)} assigned to your course block.`,
    );
  event(s, a, activity.id, "Manual instructor assignment");
  return s;
}
export function saveCourse(source: Store, a: Actor, input: Course): Store {
  requireManager(a);
  if (
    input.name.trim().length < 2 ||
    !Number.isSafeInteger(input.price) ||
    input.price < 0 ||
    !Number.isInteger(input.depositBps) ||
    input.depositBps < 0 ||
    input.depositBps > 10000 ||
    !Number.isInteger(input.capacity) ||
    input.capacity < 1 ||
    input.capacity > 4 ||
    !Number.isInteger(input.durationDays) ||
    input.durationDays < 1 ||
    input.durationDays > 30
  )
    throw new Error("Check name, price, deposit, duration and capacity (1–4).");
  const s = structuredClone(source);
  if (
    s.activities.some(
      (x) => x.courseId === input.id && reserved(s, x.id) > input.capacity,
    )
  )
    throw new Error("Capacity cannot be reduced below existing reservations.");
  const existing = s.courses.find((c) => c.id === input.id);
  const record = {
    ...input,
    id: existing?.id || id(),
    name: clean(input.name, 80),
    description: clean(input.description),
    prerequisites: clean(input.prerequisites),
    included: input.included.map((x) => clean(x, 100)).filter(Boolean),
  };
  if (existing) Object.assign(existing, record);
  else s.courses.push(record);
  event(s, a, record.id, "Course saved");
  return s;
}
export function publishActivity(
  source: Store,
  a: Actor,
  input: Omit<Activity, "id">,
): Store {
  requireManager(a);
  const s = structuredClone(source);
  if (
    !s.courses.some((c) => c.id === input.courseId && c.published) ||
    !validDate(input.date) ||
    !validDate(input.endDate) ||
    input.date < bangkokDate() ||
    input.endDate < input.date ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time) ||
    !input.site.trim() ||
    !input.boat.trim() ||
    !Number.isInteger(input.capacity) ||
    input.capacity < 1 ||
    input.capacity > 4
  )
    throw new Error("Check course, dates, time, site, boat and capacity.");
  const activity = { ...input, id: id() };
  if (activity.instructorId) {
    const problem = instructorIssue(s, activity, activity.instructorId);
    if (problem) throw new Error(problem);
  }
  if (
    activity.boat !== "Shore-based" &&
    s.activities.some((x) => x.boat === activity.boat && overlaps(x, activity))
  )
    throw new Error("Boat schedule conflict: choose another boat or date.");
  s.activities.push(activity);
  event(s, a, activity.id, "Availability published");
  return s;
}
export function reviewDocuments(
  source: Store,
  a: Actor,
  bookingId: string,
  approve: boolean,
): Store {
  requireStaff(a);
  const s = structuredClone(source);
  const b = s.bookings.find((b) => b.id === bookingId);
  if (!b) throw new Error("Booking not found.");
  if (b.participants.some((p) => p.documents !== "Submitted"))
    throw new Error(
      "Customer must submit the demo document acknowledgements first.",
    );
  const date = bangkokDate();
  for (const d of s.documents.filter((d) => d.bookingId === bookingId)) {
    d.status = approve ? "Approved" : "Review required";
    d.reviewedAt = now();
    d.reviewerId = a.id;
    d.notes =
      "Fictional operational review only; no medical assessment performed.";
    d.expiry = approve
      ? s.activities.find((x) => x.id === b.activityId)!.endDate
      : date;
  }
  b.participants.forEach((p) => {
    p.medical = approve ? "Cleared" : "Review required";
  });
  notify(
    s,
    a,
    b.id,
    "Document review",
    approve
      ? "Demo document review complete."
      : "Demo documents require further review.",
  );
  return s;
}
export function saveTraining(
  source: Store,
  a: Actor,
  key: string,
  input: {
    attendance: boolean[];
    milestones: boolean[];
    notes: string;
    status: TrainingStatus;
  },
): Store {
  const s = structuredClone(source);
  const e = s.enrolments.find((e) => e.id === key);
  const b = s.bookings.find((b) => b.id === e?.bookingId);
  const activity = s.activities.find((x) => x.id === b?.activityId);
  if (!e || !b || !activity) throw new Error("Enrolment not found.");
  if (
    a.role !== "manager" &&
    !(a.role === "instructor" && activity.instructorId === a.id)
  )
    throw new Error("Permission denied: assigned instructor or manager only.");
  if (!["Checked in", "In progress", "Completed"].includes(b.status))
    throw new Error("Check the group in before updating training.");
  if (
    !trainingStates.includes(input.status) ||
    input.attendance.length !== 3 ||
    input.milestones.length !== 3 ||
    [...input.attendance, ...input.milestones].some(
      (v) => typeof v !== "boolean",
    )
  )
    throw new Error("Invalid training progress.");
  if (
    [
      "Training complete",
      "Ready for SSI processing",
      "Processed externally",
    ].includes(input.status) &&
    ![...input.attendance, ...input.milestones].every(Boolean)
  )
    throw new Error(
      "Complete all attendance and milestones before marking training complete.",
    );
  if (input.status === "Processed externally" && a.role !== "manager")
    throw new Error("Only a manager can record external processing.");
  if (
    input.status === "Processed externally" &&
    e.status !== "Ready for SSI processing"
  )
    throw new Error(
      "Mark Ready for SSI processing before recording external processing.",
    );
  Object.assign(e, { ...input, notes: clean(input.notes), updatedAt: now() });
  if (b.status === "Checked in") setStatus(b, "In progress");
  if (
    s.enrolments
      .filter((x) => x.bookingId === b.id)
      .every((x) =>
        [
          "Training complete",
          "Ready for SSI processing",
          "Processed externally",
        ].includes(x.status),
      )
  )
    setStatus(b, "Completed");
  notify(
    s,
    a,
    b.id,
    "Training update",
    `Training status: ${input.status}. No official certification is issued.`,
  );
  return s;
}
export function allocateEquipment(
  source: Store,
  a: Actor,
  itemId: string,
  bookingId: string,
  participantId: string,
): Store {
  requireStaff(a);
  const s = structuredClone(source);
  const item = s.equipmentItems.find((i) => i.id === itemId);
  const b = s.bookings.find((b) => b.id === bookingId);
  const activity = s.activities.find((x) => x.id === b?.activityId);
  if (
    !item ||
    !b ||
    !activity ||
    !b.participants.some((p) => p.id === participantId) ||
    ["Cancelled", "Refunded", "No-show", "Completed"].includes(b.status)
  )
    throw new Error(
      "Choose an active booking, participant and inventory item.",
    );
  if (item.status !== "Available" || item.nextMaintenance < activity.endDate)
    throw new Error(
      "Item is out of service or maintenance is due before this activity ends.",
    );
  if (
    s.allocations.some(
      (x) =>
        x.itemId === itemId &&
        x.status !== "Returned" &&
        (x.status === "Checked out" ||
          overlaps(
            activity,
            s.activities.find((y) => y.id === x.activityId)!,
          )),
    )
  )
    throw new Error(
      "Equipment conflict: this item is already allocated to an overlapping activity.",
    );
  s.allocations.push({
    id: id(),
    itemId,
    bookingId,
    participantId,
    activityId: activity.id,
    status: "Reserved",
    createdAt: now(),
  });
  event(s, a, itemId, "Equipment reserved");
  return s;
}
export function moveEquipment(
  source: Store,
  a: Actor,
  key: string,
  status: "Checked out" | "Returned",
  damage = "",
): Store {
  requireStaff(a);
  const s = structuredClone(source);
  const allocation = s.allocations.find((x) => x.id === key);
  if (
    !allocation ||
    allocation.status === "Returned" ||
    (status === "Checked out" && allocation.status !== "Reserved")
  )
    throw new Error("Allocation cannot make this transition.");
  const item = s.equipmentItems.find((i) => i.id === allocation.itemId)!;
  if (
    status === "Checked out" &&
    (item.status !== "Available" ||
      s.allocations.some(
        (x) =>
          x.id !== key && x.itemId === item.id && x.status === "Checked out",
      ))
  )
    throw new Error("Item is unavailable for checkout.");
  allocation.status = status;
  if (status === "Returned") {
    allocation.returnedAt = now();
    if (damage.trim()) {
      item.status = "Damaged";
      item.damageNotes = clean(damage);
      item.updatedAt = now();
    }
    notify(
      s,
      a,
      allocation.bookingId,
      "Equipment return",
      `${item.category} returned${damage.trim() ? " with damage reported" : ""}.`,
    );
  } else event(s, a, key, "Equipment checked out");
  return s;
}
export function serviceEquipment(
  source: Store,
  a: Actor,
  key: string,
  nextDue: string,
  notes: string,
): Store {
  requireManager(a);
  const s = structuredClone(source);
  const item = s.equipmentItems.find((i) => i.id === key);
  if (!item || !validDate(nextDue) || nextDue <= bangkokDate() || !notes.trim())
    throw new Error("Enter service notes and a future next-maintenance date.");
  if (s.allocations.some((x) => x.itemId === key && x.status === "Checked out"))
    throw new Error("Return the item before servicing it.");
  if (["Lost", "Retired"].includes(item.status))
    throw new Error("Lost or retired equipment cannot return to service here.");
  s.maintenance.unshift({
    id: id(),
    itemId: key,
    date: bangkokDate(),
    notes: clean(notes),
    nextDue,
    actorId: a.id,
  });
  item.status = "Available";
  item.lastInspection = bangkokDate();
  item.nextMaintenance = nextDue;
  item.damageNotes = "";
  item.updatedAt = now();
  event(s, a, key, "Maintenance recorded");
  return s;
}
export function saveEquipment(
  source: Store,
  a: Actor,
  input: EquipmentItem,
): Store {
  requireManager(a);
  if (
    !input.category.trim() ||
    !input.size.trim() ||
    !validDate(input.nextMaintenance) ||
    !validDate(input.lastInspection) ||
    !["Available", "Maintenance", "Damaged", "Lost", "Retired"].includes(
      input.status,
    )
  )
    throw new Error("Check equipment category, size, dates and status.");
  const s = structuredClone(source);
  const existing = s.equipmentItems.find((i) => i.id === input.id);
  if (
    existing &&
    input.status !== "Available" &&
    s.allocations.some((x) => x.itemId === input.id && x.status !== "Returned")
  )
    throw new Error(
      "Return or release existing allocations before changing availability.",
    );
  const record = {
    ...input,
    id: existing?.id || `EQ-${id().slice(0, 8)}`,
    createdAt: existing?.createdAt || now(),
    updatedAt: now(),
  };
  if (existing) Object.assign(existing, record);
  else s.equipmentItems.push(record);
  event(s, a, record.id, "Inventory item saved");
  return s;
}
export function saveStaff(source: Store, a: Actor, input: StaffMember): Store {
  requireManager(a);
  if (
    input.name.trim().length < 2 ||
    !/^\S+@\S+\.\S+$/.test(input.email) ||
    !validDate(input.qualificationExpiry) ||
    !validDate(input.availableFrom) ||
    !validDate(input.availableTo) ||
    input.availableTo < input.availableFrom
  )
    throw new Error(
      "Check staff name, contact and qualification/availability dates.",
    );
  const s = structuredClone(source);
  const existing = s.staffMembers.find((p) => p.id === input.id);
  const record = {
    ...input,
    id: existing?.id || id(),
    createdAt: existing?.createdAt || now(),
    updatedAt: now(),
  };
  if (existing) Object.assign(existing, record);
  else s.staffMembers.push(record);
  event(s, a, record.id, "Staff profile saved");
  return s;
}
export function manualPayment(
  source: Store,
  a: Actor,
  key: string,
  amount: number,
): Store {
  requireStaff(a);
  const s = structuredClone(source);
  const b = s.bookings.find((b) => b.id === key);
  if (
    !b ||
    ["Cancelled", "Refunded", "No-show"].includes(b.status) ||
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    amount > balance(s, b) ||
    s.payments.some((p) => p.bookingId === key && p.status === "Pending")
  )
    throw new Error("Invalid payment amount or pending transfer review.");
  s.payments.push({
    id: id(),
    bookingId: key,
    amount,
    method: "Manual",
    status: "Approved",
    reference: `DEMO-MANUAL-${id().slice(0, 8)}`,
    createdAt: now(),
    reviewedAt: now(),
    reviewerId: a.id,
  });
  if (b.status === "Awaiting payment" && paid(s, key) >= b.deposit)
    setStatus(b, "Deposit paid");
  notify(
    s,
    a,
    key,
    "Payment received",
    "A simulated manual payment was recorded.",
  );
  return s;
}
export function cancelBooking(source: Store, a: Actor, key: string): Store {
  requireStaff(a);
  const s = structuredClone(source);
  const b = s.bookings.find((b) => b.id === key);
  if (!b || ["Completed", "Cancelled", "Refunded"].includes(b.status))
    throw new Error("Booking cannot be cancelled from this status.");
  if (
    s.allocations.some((x) => x.bookingId === key && x.status === "Checked out")
  )
    throw new Error("Return checked-out equipment before cancelling.");
  s.allocations
    .filter((x) => x.bookingId === key && x.status === "Reserved")
    .forEach((x) => {
      x.status = "Returned";
      x.returnedAt = now();
    });
  s.payments
    .filter((p) => p.bookingId === key && p.status === "Pending")
    .forEach((p) => {
      p.status = "Rejected";
      p.reviewedAt = now();
      p.reviewerId = a.id;
    });
  setStatus(b, "Cancelled");
  notify(
    s,
    a,
    key,
    "Cancellation",
    "Your fictional booking has been cancelled.",
  );
  return s;
}
export function refundBooking(
  source: Store,
  a: Actor,
  key: string,
  amount: number,
  reason: string,
): Store {
  requireManager(a);
  const s = structuredClone(source);
  const b = s.bookings.find((b) => b.id === key);
  const refunded = s.refunds
    .filter((r) => r.bookingId === key)
    .reduce((n, r) => n + r.amount, 0);
  if (
    !b ||
    !["Cancelled", "Refunded"].includes(b.status) ||
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    amount > paid(s, key) - refunded ||
    !reason.trim()
  )
    throw new Error(
      "Refund must follow cancellation and cannot exceed received funds.",
    );
  s.refunds.push({
    id: id(),
    bookingId: key,
    amount,
    reason: clean(reason),
    actorId: a.id,
    createdAt: now(),
  });
  if (refunded + amount === paid(s, key)) setStatus(b, "Refunded");
  notify(
    s,
    a,
    key,
    "Refund recorded",
    "A fictional refund was recorded; no money moved.",
  );
  return s;
}
export function operationalAlerts(s: Store) {
  const alerts: { id: string; kind: string; message: string }[] = [];
  for (const x of s.activities) {
    if (!x.instructorId)
      alerts.push({
        id: `unassigned-${x.id}`,
        kind: "Schedule",
        message: `${x.date}: ${s.courses.find((c) => c.id === x.courseId)?.name} needs an instructor.`,
      });
    else {
      const issue = instructorIssue(s, x, x.instructorId);
      if (issue)
        alerts.push({
          id: `instructor-${x.id}`,
          kind: "Schedule",
          message: `${x.date} · ${staffName(s, x.instructorId)}: ${issue}`,
        });
    }
    if (
      x.boat !== "Shore-based" &&
      s.activities.some(
        (y) => y.id !== x.id && y.boat === x.boat && overlaps(x, y),
      )
    )
      alerts.push({
        id: `boat-${x.id}`,
        kind: "Schedule",
        message: `${x.date}: ${x.boat} has overlapping activities.`,
      });
    if (reserved(s, x.id) > Math.min(4, x.capacity))
      alerts.push({
        id: `capacity-${x.id}`,
        kind: "Capacity",
        message: `${x.date}: activity is over capacity.`,
      });
  }
  for (const i of s.equipmentItems.filter(
    (i) => i.nextMaintenance <= bangkokDate() || i.status !== "Available",
  ))
    alerts.push({
      id: i.id,
      kind: "Equipment",
      message: `${i.id} · ${i.category}: ${i.status === "Available" ? "maintenance due" : i.status}.`,
    });
  for (const b of s.bookings.filter(
    (b) =>
      !["Cancelled", "Refunded", "Completed"].includes(b.status) &&
      b.participants.some(
        (p) => p.documents !== "Submitted" || p.medical !== "Cleared",
      ),
  ))
    alerts.push({
      id: b.id,
      kind: "Documents",
      message: `Booking ${b.id.slice(0, 8)} needs document submission/review.`,
    });
  return alerts;
}
