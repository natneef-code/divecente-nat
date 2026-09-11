import { type Store, type Booking, bangkokDate } from "./model";
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
export function operationsSeed(now = new Date()) {
  const stamp = now.toISOString();
  const today = bangkokDate(now);
  const next = new Date(now);
  next.setUTCFullYear(next.getUTCFullYear() + 1);
  const future = bangkokDate(next);
  return {
    schemaRevision: 2 as const,
    staffMembers: [
      {
        id: "instructor-mali",
        name: "Mali",
        role: "instructor" as const,
        email: "mali@example.test",
        phone: "Demo only",
        active: true,
        qualifiedCourseIds: ["open-water", "advanced", "nitrox"],
        qualificationExpiry: future,
        availableFrom: today,
        availableTo: future,
        createdAt: stamp,
        updatedAt: stamp,
      },
      {
        id: "instructor-ben",
        name: "Ben",
        role: "instructor" as const,
        email: "ben@example.test",
        phone: "Demo only",
        active: true,
        qualifiedCourseIds: ["open-water", "advanced", "nitrox"],
        qualificationExpiry: future,
        availableFrom: today,
        availableTo: future,
        createdAt: stamp,
        updatedAt: stamp,
      },
      {
        id: "instructor-lin",
        name: "Lin",
        role: "instructor" as const,
        email: "lin@example.test",
        phone: "Demo only",
        active: true,
        qualifiedCourseIds: ["open-water", "advanced", "nitrox"],
        qualificationExpiry: future,
        availableFrom: today,
        availableTo: future,
        createdAt: stamp,
        updatedAt: stamp,
      },
    ],
    enquiries: [],
    documents: [],
    enrolments: [],
    allocations: [],
    maintenance: [],
    notifications: [],
    refunds: [],
    equipmentItems: Object.entries(equipmentCategories).flatMap(
      ([category, sizes], i) =>
        sizes.flatMap((size, j) =>
          [1, 2].map((n) => ({
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
      currency: "THB" as const,
      timezone: "Asia/Bangkok" as const,
      language: "English",
      defaultDepositBps: 1000,
      channels: [] as string[],
    },
  };
}
export function syncBookingRecords(s: Store, b: Booking) {
  for (const p of b.participants) {
    for (const type of [
      "Medical declaration",
      "Liability waiver",
      "Terms and conditions",
    ]) {
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
    }
    if (!s.enrolments.some((e) => e.participantId === p.id))
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
}
export function migrateStore(raw: Store): Store {
  const defaults = operationsSeed();
  const s = { ...defaults, ...raw, schemaRevision: 2 as const };
  for (const b of s.bookings) syncBookingRecords(s, b);
  return s;
}
