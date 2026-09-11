import {
  type Store,
  type Actor,
  type Activity,
  type Session,
  type StaffingRule,
  type RentalSelection,
  type DiverExperience,
  type Participant,
  type BookingLine,
  STANDARD_EQUIPMENT,
  bangkokDate,
} from "./model";
const terminal = ["Cancelled", "Refunded", "No-show"];
export const occupancy = (s: Store, id: string) =>
  s.bookings
    .filter((b) => b.activityId === id && !terminal.includes(b.status))
    .reduce((n, b) => n + b.participants.length, 0);
export const isProfessional = (a: Actor) =>
  a.role === "instructor" || a.role === "divemaster";
export const assignedIds = (_s: Store, activity: Activity, session?: Session) =>
  session?.professionalIds ??
  activity.professionalIds ??
  (activity.instructorId ? [activity.instructorId] : []);
export const sessionsFor = (s: Store, a: Activity): Session[] =>
  s.sessions.filter((x) => x.activityId === a.id);
export const hasAssignment = (s: Store, a: Actor, activityId: string) => {
  const activity = s.activities.find((x) => x.id === activityId);
  return (
    !!activity &&
    (assignedIds(s, activity).includes(a.id) ||
      sessionsFor(s, activity).some((x) =>
        assignedIds(s, activity, x).includes(a.id),
      ))
  );
};
export const canEquip = (s: Store, a: Actor, activityId: string) =>
  a.role === "manager" ||
  a.role === "frontdesk" ||
  (isProfessional(a) && hasAssignment(s, a, activityId));
export function validDate(v: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    !Number.isNaN(Date.parse(v)) &&
    new Date(v).toISOString().slice(0, 10) === v
  );
}
export function rentalDays(a: Activity) {
  return (
    Math.round((Date.parse(a.endDate) - Date.parse(a.date)) / 86400000) + 1
  );
}
export function refresherRequired(
  lastDive: string,
  diveDate: string,
  months: number,
) {
  if (!validDate(lastDive) || !validDate(diveDate))
    throw new Error("Enter a valid last-dive date.");
  const d = new Date(`${lastDive}T12:00:00Z`),
    day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const last = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
  ).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return diveDate > d.toISOString().slice(0, 10);
}
export function courseEquipment(s: Store, a: Activity) {
  const course = s.courses.find((c) => c.id === a.courseId)!;
  if (course.kind === "fun-dive") return [];
  const sessions = sessionsFor(s, a);
  const wet = course.inWater || sessions.some((x) => x.inWater);
  return [
    ...new Set([
      ...(wet ? STANDARD_EQUIPMENT : []),
      ...(course.includedEquipment || []),
      ...sessions.flatMap((x) => x.includedEquipment || []),
    ]),
  ];
}
export function requestedEquipment(
  s: Store,
  a: Activity,
  p: Pick<Participant, "rental">,
) {
  const course = s.courses.find((c) => c.id === a.courseId)!;
  if (course.kind !== "fun-dive") return courseEquipment(s, a);
  return p.rental?.mode === "full"
    ? [
        ...(p.rental.categories.length
          ? p.rental.categories
          : s.settings.equipmentPackage),
      ]
    : p.rental?.mode === "individual"
      ? p.rental.categories
      : [];
}
export function effectiveRules(s: Store, a: Activity, session?: Session) {
  const course = s.courses.find((c) => c.id === a.courseId)!;
  const site = s.diveSites.find((x) => x.id === a.siteId);
  const boat = s.boats.find((x) => x.id === a.boatId);
  const rules = [
    course.staffing,
    a.staffing,
    site?.staffing,
    session?.staffing,
  ].filter(Boolean) as StaffingRule[];
  return {
    ratio: Math.min(
      s.settings.defaultStaffingRatio,
      ...rules.map((r) => r.ratio ?? Infinity),
    ),
    minimum: Math.max(1, ...rules.map((r) => r.minimum ?? 1)),
    capacity: Math.min(
      course.capacity,
      a.capacity,
      site?.capacity ?? 100,
      boat?.capacity ?? 100,
      ...rules.map((r) => r.maximum ?? Infinity),
    ),
  };
}
const interval = (x: Session) => [
  Date.parse(`${x.date}T${x.time}:00+07:00`),
  Date.parse(`${x.endDate}T${x.endTime}:00+07:00`),
];
export function sessionsOverlap(a: Session, b: Session) {
  const [start, end] = interval(a),
    [otherStart, otherEnd] = interval(b);
  return start < otherEnd && otherStart < end;
}
export function qualificationIssue(
  s: Store,
  id: string,
  a: Activity,
  session: Session,
) {
  const p = s.staffMembers.find((p) => p.id === id);
  if (!p?.active || !["instructor", "divemaster"].includes(p.role))
    return "inactive or not a dive professional";
  if (
    !p.qualifiedCourseIds.includes(a.courseId) ||
    p.qualificationExpiry < session.endDate
  )
    return "qualification missing or expired";
  if (p.availableFrom > session.date || p.availableTo < session.endDate)
    return "unavailable";
  if (
    s.sessions.some((other) => {
      if (other.id === session.id) return false;
      const act = s.activities.find((x) => x.id === other.activityId);
      return (
        !!act &&
        assignedIds(s, act, other).includes(id) &&
        sessionsOverlap(session, other)
      );
    })
  )
    return "overlapping professional assignment";
  return null;
}
export function staffingSummary(
  s: Store,
  a: Activity,
  session?: Session,
  count = occupancy(s, a.id),
) {
  const sessions = session ? [session] : sessionsFor(s, a);
  const course = s.courses.find((c) => c.id === a.courseId)!;
  const evaluations = sessions.map((x) => {
    const rules = effectiveRules(s, a, x);
    const ids = [...new Set(assignedIds(s, a, x))];
    const qualified = ids.filter((id) => !qualificationIssue(s, id, a, x));
    const required = Math.max(rules.minimum, Math.ceil(count / rules.ratio));
    const needsInstructor = course.kind !== "fun-dive" && x.inWater;
    const missingInstructor =
      needsInstructor &&
      !qualified.some(
        (id) => s.staffMembers.find((p) => p.id === id)?.role === "instructor",
      );
    const lead = x.leadId ?? a.leadId ?? a.instructorId;
    const leadValid =
      !!lead &&
      qualified.includes(lead) &&
      (!needsInstructor ||
        s.staffMembers.find((p) => p.id === lead)?.role === "instructor");
    const issues = ids.flatMap((id) => {
      const reason = qualificationIssue(s, id, a, x);
      return reason
        ? [`${s.staffMembers.find((p) => p.id === id)?.name || id}: ${reason}`]
        : [];
    });
    if (missingInstructor)
      issues.push(
        "An Instructor is required for this in-water course session.",
      );
    if (!leadValid)
      issues.push(
        needsInstructor
          ? "Assign a qualified lead Instructor."
          : "Assign a qualified lead professional.",
      );
    if (count > rules.capacity)
      issues.push("Participant count exceeds configured/boat/site capacity.");
    return {
      sessionId: x.id,
      ratio: rules.ratio,
      capacity: rules.capacity,
      required,
      assigned: qualified.length,
      selected: ids.length,
      missing: Math.max(0, required - qualified.length),
      missingInstructor,
      issues,
      ready:
        qualified.length >= required &&
        !missingInstructor &&
        leadValid &&
        count <= rules.capacity,
    };
  });
  return {
    required: Math.max(1, ...evaluations.map((x) => x.required)),
    assigned:
      Math.min(...evaluations.map((x) => x.assigned), Infinity) === Infinity
        ? 0
        : Math.min(...evaluations.map((x) => x.assigned)),
    missing: Math.max(0, ...evaluations.map((x) => x.missing)),
    missingInstructor: evaluations.some((x) => x.missingInstructor),
    ready: evaluations.length > 0 && evaluations.every((x) => x.ready),
    issues: [...new Set(evaluations.flatMap((x) => x.issues))],
    evaluations,
  };
}
export function equipmentAvailability(
  s: Store,
  a: Activity,
  extra: Pick<Participant, "rental">[] = [],
) {
  const sessions = sessionsFor(s, a);
  const concurrent = s.activities.filter((other) =>
    sessionsFor(s, other).some((o) =>
      sessions.some((x) => sessionsOverlap(x, o)),
    ),
  );
  const demands: Record<string, number> = {};
  for (const act of concurrent) {
    const people = s.bookings
      .filter((b) => b.activityId === act.id && !terminal.includes(b.status))
      .flatMap((b) => b.participants);
    if (act.id === a.id) people.push(...(extra as Participant[]));
    for (const p of people)
      for (const category of requestedEquipment(s, act, p))
        demands[category] = (demands[category] || 0) + 1;
  }
  return Object.entries(demands).map(([category, required]) => {
    const available = s.equipmentItems.filter(
      (i) =>
        i.category === category &&
        i.status === "Available" &&
        i.nextMaintenance >= a.endDate,
    ).length;
    return {
      category,
      required,
      available,
      missing: Math.max(0, required - available),
    };
  });
}
export function operationalReadiness(s: Store, a: Activity) {
  const staffing = staffingSummary(s, a);
  const requirements = s.bookings
    .filter((b) => b.activityId === a.id && !terminal.includes(b.status))
    .flatMap((b) => b.participants)
    .filter(
      (p) =>
        p.refresher &&
        !["Completed", "Overridden"].includes(p.refresher.status),
    );
  const documentsMissing = s.bookings
    .filter((b) => b.activityId === a.id && !terminal.includes(b.status))
    .flatMap((b) => b.participants)
    .some(
      (p) =>
        p.documents !== "Submitted" ||
        ["Review required", "Expired"].includes(p.medical),
    );
  const equipment = equipmentAvailability(s, a);
  const boatConflict =
    a.boat !== "Shore-based" &&
    s.activities.some(
      (other) =>
        other.id !== a.id &&
        other.boatId === a.boatId &&
        sessionsFor(s, other).some((o) =>
          sessionsFor(s, a).some((x) => sessionsOverlap(x, o)),
        ),
    );
  const issues = [
    ...staffing.issues,
    ...(documentsMissing
      ? [
          "Participant document acknowledgements or operational review are outstanding.",
        ]
      : []),
    ...(staffing.missing
      ? [`${staffing.missing} additional qualified professional(s) needed.`]
      : []),
    ...(requirements.length
      ? [`${requirements.length} mandatory Refresher(s) not completed.`]
      : []),
    ...equipment
      .filter((x) => x.missing)
      .map((x) => `${x.category}: ${x.missing} more usable item(s) needed.`),
    ...(boatConflict ? ["Boat has overlapping activity assignments."] : []),
  ];
  return {
    ...staffing,
    equipment,
    refresherCount: requirements.length,
    issues,
    ready:
      staffing.ready &&
      requirements.length === 0 &&
      equipment.every((x) => !x.missing) &&
      !boatConflict &&
      !documentsMissing,
  };
}
export type ParticipantInput = {
  name: string;
  rental?: RentalSelection;
  certification?: DiverExperience;
};
export function priceBooking(
  s: Store,
  a: Activity,
  inputs: ParticipantInput[],
  validateCertification = true,
) {
  const course = s.courses.find((c) => c.id === a.courseId)!;
  if (!inputs.length || inputs.length > 100)
    throw new Error("Choose a valid participant count.");
  const days = rentalDays(a);
  if (days < 1 || days > 31)
    throw new Error("Unsupported activity date range.");
  const participants: Participant[] = [];
  const lines: BookingLine[] = [];
  for (const input of inputs) {
    if (input.name.trim().length < 2 || input.name.trim().length > 80)
      throw new Error("Enter each participant’s name (2–80 characters).");
    const id = crypto.randomUUID();
    const rental =
      course.kind === "fun-dive"
        ? input.rental || { mode: "none", categories: [] }
        : { mode: "none" as const, categories: [] };
    if (
      !["none", "full", "individual"].includes(rental.mode) ||
      rental.categories.some((c) => !STANDARD_EQUIPMENT.includes(c))
    )
      throw new Error("Choose valid rental categories.");
    const p: Participant = {
      id,
      name: input.name.trim(),
      rental: {
        ...rental,
        categories:
          rental.mode === "full"
            ? [...s.settings.equipmentPackage]
            : [...new Set(rental.categories)],
      },
      equipment:
        course.kind === "fun-dive"
          ? rental.mode === "none"
            ? "Own equipment"
            : rental.mode === "full"
              ? "Full Equipment Package"
              : rental.categories.join(", ")
          : "Included course equipment",
      documents: "Not started",
      medical: "Not started",
      createdAt: new Date().toISOString(),
    };
    lines.push({
      id: crypto.randomUUID(),
      kind: "product",
      participantId: id,
      label: course.name,
      quantity: 1,
      unitPrice: course.price,
      amount: course.price,
    });
    if (course.kind === "fun-dive") {
      const c = input.certification;
      if (
        validateCertification &&
        (!c ||
          ![
            "SSI",
            "PADI",
            "NAUI",
            "CMAS",
            "SDI",
            "BSAC",
            "Other recognized agency",
          ].includes(c.agency) ||
          c.level.trim().length < 2 ||
          ["new diver", "none", "uncertified"].includes(
            c.level.toLowerCase(),
          ) ||
          c.number.trim().length < 2 ||
          !Number.isInteger(c.loggedDives) ||
          c.loggedDives < 0 ||
          !validDate(c.lastDive) ||
          c.lastDive > bangkokDate() ||
          c.lastDive > a.date)
      )
        throw new Error(
          "Fun Dive requires recognized certification agency, level, number, logged dives and a valid last-dive date.",
        );
      if (c)
        p.certification = {
          ...c,
          level: c.level.trim(),
          number: c.number.trim(),
        };
      if (rental.mode === "full")
        lines.push({
          id: crypto.randomUUID(),
          kind: "rental",
          participantId: id,
          label: "Full Equipment Package · per day (fictional price)",
          quantity: days,
          unitPrice: s.settings.fullPackageDailyPrice,
          amount: days * s.settings.fullPackageDailyPrice,
        });
      if (rental.mode === "individual")
        for (const category of p.rental!.categories) {
          const price =
            category === "Dive computer"
              ? s.settings.computerDailyPrice
              : s.settings.individualDailyPrices[category];
          if (!Number.isSafeInteger(price) || price < 0)
            throw new Error("Rental price is not configured.");
          lines.push({
            id: crypto.randomUUID(),
            kind: "rental",
            participantId: id,
            label: `${category} rental · per day (fictional price)`,
            quantity: days,
            unitPrice: price,
            amount: days * price,
          });
        }
      if (
        c &&
        validDate(c.lastDive) &&
        refresherRequired(c.lastDive, a.date, s.settings.refresherMonths)
      ) {
        p.refresher = {
          required: true,
          status: "Required",
          thresholdMonths: s.settings.refresherMonths,
        };
        lines.push({
          id: crypto.randomUUID(),
          kind: "refresher",
          participantId: id,
          label: "Mandatory Refresher (fictional price)",
          quantity: 1,
          unitPrice: s.settings.refresherPrice,
          amount: s.settings.refresherPrice,
          required: true,
        });
      }
    }
    participants.push(p);
  }
  const total = lines.reduce((n, l) => n + l.amount, 0);
  if (!Number.isSafeInteger(total) || total < 0)
    throw new Error("Invalid booking total.");
  return {
    participants,
    lines,
    total,
    deposit: Math.round((total * course.depositBps) / 10000),
  };
}
