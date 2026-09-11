import {
  type Store,
  type Actor,
  type StaffingRule,
  type Settings,
  STANDARD_EQUIPMENT,
} from "./model";
import { event } from "./commands";
import {
  canEquip,
  isProfessional,
  hasAssignment,
  validDate,
  qualificationIssue,
  sessionsFor,
  operationalReadiness,
} from "./policies";
const admin = (a: Actor) => {
  if (a.role !== "manager")
    throw new Error("Permission denied: Manager required.");
};
const desk = (a: Actor) => {
  if (!["manager", "frontdesk"].includes(a.role))
    throw new Error("Permission denied: Front Desk or Manager required.");
};
export function validateRule(rule: StaffingRule) {
  for (const key of ["ratio", "minimum", "maximum"] as const) {
    const value = rule[key];
    if (
      value !== undefined &&
      (!Number.isInteger(value) ||
        value < 1 ||
        value > (key === "maximum" ? 100 : 50))
    )
      throw new Error(
        "Staffing overrides must be positive whole numbers (maximum participants up to 100).",
      );
  }
}
export function assignTeam(
  source: Store,
  a: Actor,
  activityId: string,
  ids: string[],
  leadId: string | null,
  sessionId?: string,
) {
  desk(a);
  const s = structuredClone(source);
  const activity = s.activities.find((x) => x.id === activityId);
  if (!activity) throw new Error("Activity not found.");
  const unique = [...new Set(ids)];
  if (unique.length !== ids.length || (leadId && !unique.includes(leadId)))
    throw new Error("Lead must belong to the selected professionals.");
  if (sessionId) {
    const session = s.sessions.find(
      (x) => x.id === sessionId && x.activityId === activityId,
    );
    if (!session) throw new Error("Session not found.");
    session.professionalIds = unique;
    session.leadId = leadId;
  } else {
    activity.professionalIds = unique;
    activity.leadId = leadId;
    activity.instructorId = leadId;
  }
  for (const session of sessionsFor(s, activity).filter(
    (x) => !sessionId || x.id === sessionId,
  ))
    for (const id of session.professionalIds ?? unique) {
      const problem = qualificationIssue(s, id, activity, session);
      if (problem)
        throw new Error(
          `${s.staffMembers.find((p) => p.id === id)?.name || id}: ${problem}.`,
        );
    }
  activity.readinessStatus = "Draft";
  event(
    s,
    a,
    sessionId || activityId,
    "Manual professional assignment updated",
  );
  return s;
}
export function saveRule(
  source: Store,
  a: Actor,
  target: "course" | "activity" | "session" | "site",
  key: string,
  rule: StaffingRule,
  capacity?: number,
  inWater?: boolean,
  includedEquipment?: string[],
) {
  admin(a);
  validateRule(rule);
  if (includedEquipment?.some((x) => !STANDARD_EQUIPMENT.includes(x)))
    throw new Error("Invalid included equipment category.");
  if (
    capacity !== undefined &&
    (!Number.isInteger(capacity) || capacity < 1 || capacity > 100)
  )
    throw new Error("Participant capacity must be between 1 and 100.");
  const s = structuredClone(source);
  if (target === "course") {
    const c = s.courses.find((x) => x.id === key);
    if (!c) throw new Error("Course not found.");
    c.staffing = rule;
    if (includedEquipment)
      c.includedEquipment = [...new Set(includedEquipment)];
    if (capacity !== undefined) c.capacity = capacity;
    if (inWater !== undefined) c.inWater = inWater;
  } else if (target === "activity") {
    const x = s.activities.find((x) => x.id === key);
    if (!x) throw new Error("Activity not found.");
    x.staffing = rule;
    if (capacity !== undefined) x.capacity = capacity;
  } else if (target === "session") {
    const x = s.sessions.find((x) => x.id === key);
    if (!x) throw new Error("Session not found.");
    x.staffing = rule;
    if (inWater !== undefined) x.inWater = inWater;
    if (includedEquipment)
      x.includedEquipment = [...new Set(includedEquipment)];
  } else {
    const x = s.diveSites.find((x) => x.id === key);
    if (!x) throw new Error("Dive Site not found.");
    x.staffing = rule;
    if (capacity !== undefined) x.capacity = capacity;
  }
  s.activities.forEach((x) => (x.readinessStatus = "Draft"));
  event(s, a, key, `${target} staffing/capacity rules updated`);
  return s;
}
export function saveSettings(source: Store, a: Actor, input: Settings) {
  admin(a);
  if (
    !Number.isInteger(input.defaultStaffingRatio) ||
    input.defaultStaffingRatio < 1 ||
    input.defaultStaffingRatio > 20 ||
    !Number.isInteger(input.refresherMonths) ||
    input.refresherMonths < 1 ||
    input.refresherMonths > 24 ||
    !Number.isInteger(input.defaultDepositBps) ||
    input.defaultDepositBps < 0 ||
    input.defaultDepositBps > 10000
  )
    throw new Error("Check staffing ratio, Refresher months and deposit rule.");
  for (const amount of [
    input.refresherPrice,
    input.computerDailyPrice,
    input.fullPackageDailyPrice,
    ...Object.values(input.individualDailyPrices),
  ])
    if (!Number.isSafeInteger(amount) || amount < 0 || amount > 100000000)
      throw new Error("Prices must be non-negative currency values.");
  if (
    !input.equipmentPackage.length ||
    input.equipmentPackage.some(
      (c) =>
        ![
          "Wetsuit 3 mm",
          "Fins",
          "Regulator set",
          "Mask",
          "Dive computer",
        ].includes(c),
    )
  )
    throw new Error("Choose valid equipment-package contents.");
  const s = structuredClone(source);
  s.settings = {
    ...input,
    equipmentPackage: [...new Set(input.equipmentPackage)],
    currency: "THB",
    timezone: "Asia/Bangkok",
  };
  s.activities.forEach((x) => (x.readinessStatus = "Draft"));
  event(
    s,
    a,
    "settings",
    "Manager configuration updated; existing booking financial snapshots preserved",
  );
  return s;
}
export function saveBoatCapacity(
  source: Store,
  a: Actor,
  key: string,
  capacity: number,
) {
  admin(a);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100)
    throw new Error("Boat capacity must be 1–100.");
  const s = structuredClone(source);
  const boat = s.boats.find((b) => b.id === key);
  if (!boat) throw new Error("Boat not found.");
  boat.capacity = capacity;
  s.activities
    .filter((x) => x.boatId === key)
    .forEach((x) => (x.readinessStatus = "Draft"));
  event(s, a, key, "Boat passenger capacity changed");
  return s;
}
export function markReady(source: Store, a: Actor, key: string) {
  desk(a);
  const s = structuredClone(source);
  const activity = s.activities.find((x) => x.id === key);
  if (!activity) throw new Error("Activity not found.");
  const result = operationalReadiness(s, activity);
  if (!result.ready)
    throw new Error(
      result.issues.join(" ") || "Staffing coverage is insufficient.",
    );
  activity.readinessStatus = "Ready";
  event(
    s,
    a,
    key,
    "Activity marked operationally ready after policy validation",
  );
  return s;
}
export function updateRefresher(
  source: Store,
  a: Actor,
  bookingId: string,
  participantId: string,
  action: "schedule" | "complete" | "override",
  date = "",
  reason = "",
) {
  const s = structuredClone(source);
  const b = s.bookings.find((b) => b.id === bookingId);
  const p = b?.participants.find((p) => p.id === participantId);
  const activity = s.activities.find((x) => x.id === b?.activityId);
  if (
    !b ||
    !p?.refresher ||
    !activity ||
    ["Cancelled", "Refunded"].includes(b.status)
  )
    throw new Error("Active Refresher requirement not found.");
  if (!canEquip(s, a, activity.id)) throw new Error("Permission denied.");
  const r = p.refresher;
  if (action === "override") {
    admin(a);
    if (reason.trim().length < 8)
      throw new Error("A meaningful Manager override reason is required.");
    r.status = "Overridden";
    r.overrideReason = reason.trim();
    r.overriddenBy = a.id;
    r.overriddenAt = new Date().toISOString();
    event(
      s,
      a,
      b.id,
      `Manager Refresher override for ${p.id}: ${r.overrideReason}`,
    );
  } else if (action === "schedule") {
    if (
      !["Required", "Scheduled"].includes(r.status) ||
      !validDate(date) ||
      date > activity.date
    )
      throw new Error(
        "Schedule the required Refresher on or before the Fun Dive date.",
      );
    r.status = "Scheduled";
    r.scheduledFor = date;
    event(s, a, b.id, `Refresher scheduled for ${p.id} on ${date}`);
  } else {
    if (!isProfessional(a) || !hasAssignment(s, a, activity.id))
      throw new Error(
        "Only an assigned Instructor or Divemaster can record Refresher completion.",
      );
    if (r.status !== "Scheduled" || !r.scheduledFor)
      throw new Error("Schedule the Refresher before completing it.");
    if (
      !sessionsFor(s, activity).some(
        (x) => !qualificationIssue(s, a.id, activity, x),
      )
    )
      throw new Error("Professional qualification or availability is invalid.");
    r.status = "Completed";
    r.completedAt = new Date().toISOString();
    r.completedBy = a.id;
    event(s, a, b.id, `Required Refresher completed for ${p.id}`);
  }
  activity.readinessStatus = "Draft";
  b.updatedAt = new Date().toISOString();
  return s;
}

export function addOperationalNote(
  source: Store,
  a: Actor,
  key: string,
  note: string,
) {
  const s = structuredClone(source);
  const activity = s.activities.find((x) => x.id === key);
  if (!activity || !canEquip(s, a, key))
    throw new Error(
      "Permission denied: assigned professional or Front Desk required.",
    );
  if (note.trim().length < 3 || note.trim().length > 1000)
    throw new Error(
      "Enter an operational note of 3–1000 characters; no sensitive information.",
    );
  activity.operationalNotes ??= [];
  activity.operationalNotes.push({
    id: crypto.randomUUID(),
    actorId: a.id,
    at: new Date().toISOString(),
    text: note.trim(),
  });
  event(s, a, key, "Operational note recorded");
  return s;
}
