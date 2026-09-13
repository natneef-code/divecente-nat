import {
  type Store,
  type Booking,
  type Course,
  type Activity,
  type Session,
  bangkokDate,
  STANDARD_EQUIPMENT,
} from "./model";
export const equipmentCategories: Record<string, string[]> = {
  Mask: ["Universal"],
  Snorkel: ["Universal"],
  Fins: ["XS", "S", "M", "L", "XL"],
  "Wetsuit 3 mm": ["XS", "S", "M", "L", "XL", "XXL"],
  BCD: ["XXS", "XS", "S", "M", "L", "XL"],
  "Regulator set": ["Universal"],
  "Dive computer": ["Universal"],
  "Air tank": ["12 L"],
  "Weight belt": ["Universal"],
  "Weight blocks": ["1 kg"],
  SMB: ["Universal"],
  Compass: ["Universal"],
  "Dive torch": ["Universal"],
  "Dive bag": ["Universal"],
};
export const funDiveCourse: Course = {
  id: "fun-dive",
  kind: "fun-dive",
  inWater: true,
  name: "Fun Dive",
  category: "Recreational diving · certified divers",
  description:
    "Explore Koh Tao with a qualified dive professional. A recreational trip for certified divers, with equipment rental chosen separately.",
  price: 250000,
  depositBps: 1000,
  durationDays: 1,
  capacity: 8,
  prerequisites:
    "Recognized certification and dive experience are required. A Refresher is mandatory after the configured gap since your last dive.",
  included: [
    "Qualified dive professional",
    "Boat trip",
    "Fictional demo trip price",
  ],
  includedEquipment: [],
  published: true,
  staffing: {},
};
export function operationsSeed(now = new Date()) {
  const stamp = now.toISOString(),
    today = bangkokDate(now);
  const later = new Date(now);
  later.setUTCFullYear(later.getUTCFullYear() + 1);
  const future = bangkokDate(later);
  const people = [
    ["instructor-mali", "Mali", "instructor"],
    ["instructor-ben", "Ben", "instructor"],
    ["instructor-lin", "Lin", "instructor"],
    ["divemaster-dao", "Dao", "divemaster"],
  ] as const;
  return {
    schemaRevision: 3 as const,
    staffMembers: people.map(([id, name, role]) => ({
      id,
      name,
      role,
      email: `${name.toLowerCase()}@example.test`,
      phone: "Demo only",
      active: true,
      qualifiedCourseIds: ["open-water", "advanced", "nitrox", "fun-dive"],
      qualificationExpiry: future,
      availableFrom: today,
      availableTo: future,
      createdAt: stamp,
      updatedAt: stamp,
    })),
    enquiries: [],
    documents: [],
    enrolments: [],
    allocations: [],
    maintenance: [],
    notifications: [],
    refunds: [],
    sessions: [] as Session[],
    boats: [
      {
        id: "boat-blue",
        name: "Blue Current",
        capacity: 12,
        active: true,
        notes: "Fictional training boat",
      },
      {
        id: "boat-willow",
        name: "Sea Willow",
        capacity: 12,
        active: true,
        notes: "Fictional day boat",
      },
      {
        id: "boat-shore",
        name: "Shore-based",
        capacity: 100,
        active: true,
        notes: "No vessel required",
      },
      {
        id: "boat-coral",
        name: "Coral Wind",
        capacity: 12,
        active: true,
        notes: "Fictional Fun Dive boat",
      },
    ],
    diveSites: [
      {
        id: "site-reefs",
        name: "Mae Haad pool & Koh Tao reefs",
        capacity: 12,
        staffing: {},
        active: true,
        notes: "Fictional pool and reef training area",
      },
      {
        id: "site-koh-tao",
        name: "Koh Tao dive sites",
        capacity: 12,
        staffing: {},
        active: true,
        notes: "Fictional recreational dive area",
      },
      {
        id: "site-classroom",
        name: "Natneef classroom",
        capacity: 20,
        staffing: {},
        active: true,
        notes: "Fictional dry classroom",
      },
    ],
    equipmentItems: Object.entries(equipmentCategories).flatMap(
      ([category, sizes], i) =>
        sizes.flatMap((size, j) =>
          Array.from(
            { length: sizes.length === 1 ? 8 : 2 },
            (_, k) => k + 1,
          ).map((n) => ({
            id: `EQ-${String(i + 1).padStart(2, "0")}-${j + 1}-${n}`,
            category,
            brand: "Demo",
            model: "Training series",
            size,
            serial: `FICTIONAL-${i}-${j}-${n}`,
            status: "Available" as const,
            lastInspection: today,
            nextMaintenance: future,
            damageNotes: "",
            createdAt: stamp,
            updatedAt: stamp,
          })),
        ),
    ),
    settings: {
      name: "Natneef Diving",
      contactEmail: "hello@example.test",
      contactPhone: "+66 DEMO ONLY",
      bookingPrefix: "NAT",
      taxPercent: 0,
      currency: "THB" as const,
      timezone: "Asia/Bangkok" as const,
      language: "English",
      defaultDepositBps: 1000,
      channels: [] as string[],
      defaultStaffingRatio: 4,
      refresherMonths: 3,
      refresherPrice: 100000,
      computerDailyPrice: 25000,
      fullPackageDailyPrice: 50000,
      equipmentPackage: [...STANDARD_EQUIPMENT],
      individualDailyPrices: {
        "Wetsuit 3 mm": 15000,
        Fins: 10000,
        "Regulator set": 20000,
        Mask: 5000,
      },
    },
  };
}
export function makeSessions(activity: Activity, course: Course): Session[] {
  const result: Session[] = [];
  const current = new Date(`${activity.date}T12:00:00Z`);
  for (
    let i = 0;
    i < 31 && current.toISOString().slice(0, 10) <= activity.endDate;
    i++
  ) {
    const date = current.toISOString().slice(0, 10);
    result.push({
      id: `session-${activity.id}-${i}`,
      activityId: activity.id,
      date,
      endDate: date,
      time: activity.time,
      endTime: "16:00",
      inWater: course.inWater ?? course.id !== "nitrox",
      staffing: {},
    });
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return result;
}
export function syncBookingRecords(s: Store, b: Booking) {
  const activity = s.activities.find((a) => a.id === b.activityId);
  const course = s.courses.find((c) => c.id === activity?.courseId);
  b.kind ??= course?.kind ?? "course";
  for (const p of b.participants) {
    p.rental ??= { mode: "none", categories: [] };
    for (const type of [
      "Medical declaration",
      "Liability waiver",
      "Terms and conditions",
    ])
      if (!s.documents.some((d) => d.participantId === p.id && d.type === type))
        s.documents.push({
          id: `${p.id}-${type}`,
          bookingId: b.id,
          participantId: p.id,
          type,
          status: p.documents === "Submitted" ? "Submitted" : "Not started",
          version: "demo-v1",
          ...(p.documents === "Submitted" ? { submittedAt: b.createdAt } : {}),
          notes: "",
        });
    if (
      b.kind !== "fun-dive" &&
      !s.enrolments.some((e) => e.participantId === p.id)
    )
      s.enrolments.push({
        id: `enrolment-${p.id}`,
        bookingId: b.id,
        participantId: p.id,
        status: "Enrolled",
        attendance: [false, false, false],
        milestones: [false, false, false],
        notes: "",
        updatedAt: b.createdAt,
      });
  }
  b.lineItems ??= [
    {
      id: `legacy-${b.id}`,
      kind: "legacy",
      label: "Historical booking amount retained",
      quantity: 1,
      unitPrice: b.total,
      amount: b.total,
    },
  ];
}
export function migrateStore(raw: Store): Store {
  raw = structuredClone(raw);
  const defaults = operationsSeed();
  const legacy = raw.schemaRevision !== 3;
  const s: Store = {
    ...defaults,
    ...raw,
    settings: { ...defaults.settings, ...raw.settings },
    schemaRevision: 3,
  };
  s.courses = s.courses.map((c) => ({
    ...c,
    kind: c.kind ?? "course",
    inWater: c.inWater ?? c.id !== "nitrox",
    includedEquipment:
      c.includedEquipment ?? (c.id === "nitrox" ? [] : [...STANDARD_EQUIPMENT]),
    staffing: c.staffing ?? {},
  }));
  if (!s.courses.some((c) => c.id === "fun-dive")) {
    s.courses.push(structuredClone(funDiveCourse));
    const today = bangkokDate();
    const d = new Date(`${today}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 5);
    const date = d.toISOString().slice(0, 10);
    s.activities.push({
      id: "fun-dive-0",
      courseId: "fun-dive",
      date,
      endDate: date,
      time: "09:00",
      site: "Koh Tao dive sites",
      siteId: "site-koh-tao",
      boat: "Coral Wind",
      boatId: "boat-coral",
      capacity: 8,
      instructorId: "divemaster-dao",
      leadId: "divemaster-dao",
      professionalIds: ["divemaster-dao"],
      staffing: {},
      readinessStatus: "Draft",
    });
  }
  if (!s.staffMembers.some((p) => p.id === "divemaster-dao"))
    s.staffMembers.push(
      defaults.staffMembers.find((p) => p.id === "divemaster-dao")!,
    );
  if (legacy)
    for (const p of s.staffMembers)
      if (
        ["instructor-mali", "instructor-ben", "instructor-lin"].includes(
          p.id,
        ) &&
        !p.qualifiedCourseIds.includes("fun-dive")
      )
        p.qualifiedCourseIds.push("fun-dive");
  for (const a of s.activities) {
    a.professionalIds ??= a.instructorId ? [a.instructorId] : [];
    a.leadId ??= a.instructorId;
    a.boatId ??= s.boats.find((b) => b.name === a.boat)?.id;
    a.siteId ??= s.diveSites.find((x) => x.name === a.site)?.id;
    a.staffing ??= {};
    a.readinessStatus ??= "Draft";
    if (!s.sessions.some((x) => x.activityId === a.id)) {
      const course = s.courses.find((c) => c.id === a.courseId);
      if (course) s.sessions.push(...makeSessions(a, course));
    }
  }
  for (const b of s.bookings) syncBookingRecords(s, b);
  return s;
}
