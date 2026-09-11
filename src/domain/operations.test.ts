import { describe, it, expect } from "vitest";
import { seed } from "./seed";
import {
  actorFor,
  STANDARD_EQUIPMENT,
  type Store,
  type DiverExperience,
} from "./model";
import { createBooking, submitPayment, advanceBooking } from "./commands";
import {
  priceBooking,
  refresherRequired,
  staffingSummary,
  effectiveRules,
  operationalReadiness,
  qualificationIssue,
  courseEquipment,
} from "./policies";
import {
  assignTeam,
  saveRule,
  saveSettings,
  updateRefresher,
  markReady,
  saveBoatCapacity,
} from "./staffing";
import {
  allocateEquipment,
  moveEquipment,
  correctAllocation,
  saveTraining,
  reviewDocuments,
} from "./operations";
import { migrateStore } from "./records";
const customer = actorFor("customer"),
  desk = actorFor("frontdesk"),
  manager = actorFor("manager"),
  instructor = actorFor("instructor"),
  dm = actorFor("divemaster");
const cert = (
  lastDive = new Date(Date.now() - 86400000 * 10).toISOString().slice(0, 10),
): DiverExperience => ({
  agency: "SSI",
  level: "Open Water",
  number: "DEMO-123",
  loggedDives: 20,
  lastDive,
});
const book = (s = seed(), fun = false, count = 1, old = false) =>
  createBooking(s, customer, {
    activityId: fun ? "fun-dive-0" : "open-water-0",
    participants: Array.from({ length: count }, (_, i) => ({
      name: `Fictional Diver ${i}`,
      ...(fun
        ? {
            certification: cert(old ? "2020-01-01" : undefined),
            rental: { mode: "none" as const, categories: [] },
          }
        : {}),
    })),
    documents: true,
    terms: true,
    prerequisites: true,
    method: "QR",
  });
const paidConfirmed = (s: Store, id: string) =>
  advanceBooking(submitPayment(s, customer, id), desk, id);
function sixCourse() {
  let s = seed();
  s = saveRule(s, manager, "course", "open-water", {}, 8);
  s = saveRule(s, manager, "activity", "open-water-0", {}, 8);
  return assignTeam(
    s,
    desk,
    "open-water-0",
    [instructor.id, dm.id],
    instructor.id,
  );
}
describe("confirmed operating rules", () => {
  it("includes all five in-water equipment categories without a computer surcharge", () => {
    const s = seed(),
      a = s.activities[0];
    const q = priceBooking(s, a, [
      {
        name: "Demo Diver",
        rental: { mode: "individual", categories: ["Dive computer"] },
      },
    ]);
    expect(q.total).toBe(850000);
    expect(q.deposit).toBe(85000);
    expect(q.lines.filter((l) => l.kind === "rental")).toHaveLength(0);
    expect(courseEquipment(s, a)).toEqual(
      expect.arrayContaining(STANDARD_EQUIPMENT),
    );
    expect(q.participants[0]).not.toHaveProperty("size");
  });
  it("supports dry sessions and future configurable inclusion", () => {
    const s = seed(),
      a = s.activities.find((x) => x.courseId === "nitrox")!;
    expect(courseEquipment(s, a)).toEqual([]);
    s.sessions.find((x) => x.activityId === a.id)!.inWater = true;
    expect(courseEquipment(s, a)).toEqual(
      expect.arrayContaining(STANDARD_EQUIPMENT),
    );
  });
  it("prices Fun Dive without a computer by default and creates no training enrolment", () => {
    const { state, id } = book(seed(), true);
    expect(state.bookings[0].total).toBe(250000);
    expect(state.enrolments.filter((x) => x.bookingId === id)).toHaveLength(0);
    expect(
      state.bookings[0].lineItems?.filter((l) => l.kind === "rental"),
    ).toHaveLength(0);
  });
  it("charges optional Fun Dive computer per day", () => {
    const s = seed(),
      a = s.activities.find((x) => x.id === "fun-dive-0")!;
    a.endDate = new Date(Date.parse(a.date) + 86400000)
      .toISOString()
      .slice(0, 10);
    const q = priceBooking(s, a, [
      {
        name: "Demo Diver",
        certification: cert(),
        rental: { mode: "individual", categories: ["Dive computer"] },
      },
    ]);
    expect(q.total).toBe(300000);
    expect(q.lines.find((l) => l.kind === "rental")?.quantity).toBe(2);
  });
  it("supports full package and individual category prices", () => {
    const s = seed(),
      a = s.activities.find((x) => x.id === "fun-dive-0")!;
    const q = priceBooking(s, a, [
      {
        name: "Demo Diver",
        certification: cert(),
        rental: { mode: "full", categories: [] },
      },
    ]);
    expect(q.total).toBe(300000);
    expect(q.participants[0].rental?.categories).toContain("Dive computer");
    const individual = priceBooking(s, a, [
      {
        name: "Demo Diver",
        certification: cert(),
        rental: { mode: "individual", categories: ["Mask", "Fins"] },
      },
    ]);
    expect(individual.total).toBe(265000);
  });
  it("requires all Fun Dive certification and experience fields", () => {
    const s = seed(),
      a = s.activities.find((x) => x.id === "fun-dive-0")!;
    for (const patch of [
      { agency: "" },
      { level: "uncertified" },
      { number: "" },
      { loggedDives: -1 },
      { loggedDives: 1.5 },
      { lastDive: "2099-01-01" },
      { lastDive: "" },
    ])
      expect(() =>
        priceBooking(s, a, [
          { name: "Demo Diver", certification: { ...cert(), ...patch } },
        ]),
      ).toThrow("Fun Dive requires");
    expect(() => priceBooking(s, a, [{ name: "Demo Diver" }])).toThrow();
  });
  it("uses calendar-month boundary, including leap and month-end clamping", () => {
    expect(refresherRequired("2026-01-31", "2026-04-30", 3)).toBe(false);
    expect(refresherRequired("2026-01-31", "2026-05-01", 3)).toBe(true);
    expect(refresherRequired("2023-11-30", "2024-02-29", 3)).toBe(false);
    expect(refresherRequired("2023-11-30", "2024-03-01", 3)).toBe(true);
    expect(refresherRequired("2026-06-10", "2026-09-10", 3)).toBe(false);
    expect(() => refresherRequired("2026-02-30", "2026-09-10", 3)).toThrow();
  });
  it("automatically adds mandatory Refresher and allows booking before completion", () => {
    const { state } = book(seed(), true, 1, true);
    expect(state.bookings[0].total).toBe(350000);
    expect(state.bookings[0].deposit).toBe(35000);
    expect(
      state.bookings[0].lineItems?.find((x) => x.kind === "refresher")
        ?.required,
    ).toBe(true);
    expect(state.bookings[0].participants[0].refresher?.status).toBe(
      "Required",
    );
  });
  it("blocks check-in and readiness until Refresher scheduled and completed by professional", () => {
    let { state, id } = book(seed(), true, 1, true);
    state = paidConfirmed(state, id);
    const p = state.bookings[0].participants[0];
    expect(() => advanceBooking(state, desk, id)).toThrow("Refresher");
    expect(() => markReady(state, desk, "fun-dive-0")).toThrow("Refresher");
    expect(() => updateRefresher(state, dm, id, p.id, "complete")).toThrow(
      "Schedule",
    );
    state = updateRefresher(
      state,
      desk,
      id,
      p.id,
      "schedule",
      state.activities.find((a) => a.id === "fun-dive-0")!.date,
    );
    expect(() => updateRefresher(state, desk, id, p.id, "complete")).toThrow(
      "assigned",
    );
    state = updateRefresher(state, dm, id, p.id, "complete");
    expect(advanceBooking(state, desk, id).bookings[0].status).toBe(
      "Checked in",
    );
  });
  it("preserves mandatory record and price after a reasoned Manager override", () => {
    let { state, id } = book(seed(), true, 1, true);
    const p = state.bookings[0].participants[0];
    expect(() =>
      updateRefresher(state, desk, id, p.id, "override", "", "reason given"),
    ).toThrow("Manager");
    expect(() =>
      updateRefresher(state, manager, id, p.id, "override", "", ""),
    ).toThrow("reason");
    state = updateRefresher(
      state,
      manager,
      id,
      p.id,
      "override",
      "",
      "Prior refresher evidence reviewed in demo",
    );
    expect(state.bookings[0].participants[0].refresher).toMatchObject({
      required: true,
      status: "Overridden",
      overriddenBy: manager.id,
    });
    expect(state.bookings[0].total).toBe(350000);
    expect(state.events[0]?.action).toContain("override");
  });
  it("allows six course students with an Instructor and Divemaster", () => {
    const { state } = book(sixCourse(), false, 6);
    const summary = staffingSummary(state, state.activities[0]);
    expect(summary).toMatchObject({
      required: 2,
      assigned: 2,
      missing: 0,
      ready: true,
    });
    expect(state.bookings[0].total).toBe(5100000);
  });
  it("does not equate a participant capacity of eight with sufficient staffing", () => {
    let s = sixCourse();
    s = assignTeam(s, desk, "open-water-0", [instructor.id], instructor.id);
    expect(effectiveRules(s, s.activities[0]).capacity).toBe(8);
    expect(() => book(s, false, 6)).toThrow("Additional qualified");
    expect(staffingSummary(s, s.activities[0], undefined, 6)).toMatchObject({
      required: 2,
      assigned: 1,
      missing: 1,
      ready: false,
    });
  });
  it("DM-only course staffing cannot be operationally ready", () => {
    const s = assignTeam(seed(), desk, "open-water-0", [dm.id], dm.id);
    expect(staffingSummary(s, s.activities[0], undefined, 3)).toMatchObject({
      missingInstructor: true,
      ready: false,
    });
    expect(() => markReady(s, desk, "open-water-0")).toThrow("Instructor");
  });
  it("six Fun Divers require two qualified professionals and can be led by DM", () => {
    const one = seed(),
      a = one.activities.find((x) => x.id === "fun-dive-0")!;
    expect(staffingSummary(one, a, undefined, 6).missing).toBe(1);
    const s = assignTeam(one, desk, a.id, [dm.id, instructor.id], dm.id);
    expect(book(s, true, 6).state.bookings[0].participants).toHaveLength(6);
  });
  it("combines stricter Course Template, Session, Activity and Dive Site rules", () => {
    let s = sixCourse();
    const a = s.activities[0],
      session = s.sessions.find((x) => x.activityId === a.id)!;
    s = saveRule(s, manager, "course", a.courseId, { ratio: 3, minimum: 2 }, 8);
    s = saveRule(s, manager, "activity", a.id, { ratio: 2 }, 8);
    s = saveRule(s, manager, "session", session.id, { minimum: 4, maximum: 7 });
    s = saveRule(s, manager, "site", a.siteId!, { ratio: 1 }, 9);
    expect(
      effectiveRules(
        s,
        s.activities[0],
        s.sessions.find((x) => x.id === session.id),
      ),
    ).toEqual({ ratio: 1, minimum: 4, capacity: 7 });
  });
  it("enforces separate boat and site capacities", () => {
    let s = sixCourse();
    s = saveBoatCapacity(s, manager, s.activities[0].boatId!, 5);
    expect(() => book(s, false, 6)).toThrow("capacity");
    s = saveRule(s, manager, "site", s.activities[0].siteId!, {}, 3);
    expect(effectiveRules(s, s.activities[0]).capacity).toBe(3);
  });
  it("rejects overlapping Instructor and Divemaster assignments", () => {
    let s = sixCourse();
    expect(() =>
      assignTeam(s, desk, "advanced-0", [instructor.id], instructor.id),
    ).toThrow("overlapping");
    expect(() => assignTeam(s, desk, "advanced-0", [dm.id], dm.id)).toThrow(
      "overlapping",
    );
  });
  it("checks qualification expiry and availability", () => {
    const s = seed(),
      a = s.activities[0],
      session = s.sessions.find((x) => x.activityId === a.id)!;
    s.staffMembers.find((p) => p.id === instructor.id)!.qualificationExpiry =
      "2000-01-01";
    expect(qualificationIssue(s, instructor.id, a, session)).toContain(
      "expired",
    );
  });
  it("assigned Instructor and DM allocate assets while unrelated professionals and customers cannot", () => {
    let { state, id } = book(sixCourse());
    const p = state.bookings[0].participants[0],
      item = state.equipmentItems.find((x) => x.category === "Mask")!;
    expect(() => allocateEquipment(state, customer, item.id, id, p.id)).toThrow(
      "Permission",
    );
    expect(() =>
      allocateEquipment(
        state,
        { role: "instructor", id: "unassigned" },
        item.id,
        id,
        p.id,
      ),
    ).toThrow("Permission");
    state = allocateEquipment(state, dm, item.id, id, p.id);
    expect(state.allocations).toHaveLength(1);
    state = moveEquipment(
      state,
      instructor,
      state.allocations[0].id,
      "Checked out",
    );
    state = moveEquipment(
      state,
      dm,
      state.allocations[0].id,
      "Returned",
      "Fictional strap damage",
    );
    expect(state.equipmentItems.find((x) => x.id === item.id)?.status).toBe(
      "Damaged",
    );
  });
  it("Front Desk correction preserves old allocation and audit, and replacement overlaps are rejected", () => {
    let { state, id } = book();
    const p = state.bookings[0].participants[0],
      items = state.equipmentItems.filter((x) => x.category === "Mask");
    state = allocateEquipment(state, instructor, items[0].id, id, p.id);
    const old = state.allocations[0].id;
    expect(() => correctAllocation(state, desk, old, items[1].id, "")).toThrow(
      "reason",
    );
    state = correctAllocation(
      state,
      desk,
      old,
      items[1].id,
      "Fitting corrected to another asset",
    );
    expect(state.allocations.map((x) => x.status)).toEqual([
      "Returned",
      "Reserved",
    ]);
    expect(state.events[0]?.action).toContain("corrected");
    expect(() =>
      allocateEquipment(state, instructor, items[1].id, id, p.id),
    ).toThrow("conflict");
  });
  it("DM cannot approve training; qualified assigned Instructor can", () => {
    let { state, id } = book(sixCourse());
    state = advanceBooking(paidConfirmed(state, id), desk, id);
    const e = state.enrolments[0],
      input = {
        attendance: [true, true, true],
        milestones: [true, true, true],
        notes: "Fictional debrief",
        status: "Ready for SSI processing" as const,
      };
    expect(() => saveTraining(state, dm, e.id, input)).toThrow("Instructor");
    expect(() => saveTraining(state, manager, e.id, input)).toThrow(
      "Instructor",
    );
    state = saveTraining(state, instructor, e.id, input);
    expect(state.enrolments[0].status).toBe("Ready for SSI processing");
  });
  it("manager configuration cannot reprice an existing booking", () => {
    let { state } = book(seed(), true, 1, true);
    state = saveSettings(state, manager, {
      ...state.settings,
      refresherPrice: 900000,
      computerDailyPrice: 50000,
    });
    expect(state.bookings[0].total).toBe(350000);
    expect(() => saveSettings(state, desk, state.settings)).toThrow("Manager");
    expect(() =>
      saveSettings(state, manager, { ...state.settings, refresherMonths: 0 }),
    ).toThrow();
  });
  it("migrates legacy data additively without losing bookings, payment amounts or IDs", () => {
    const { state, id } = book();
    const legacy = JSON.parse(
      JSON.stringify(submitPayment(state, customer, id)),
    );
    delete legacy.schemaRevision;
    delete legacy.sessions;
    delete legacy.boats;
    delete legacy.diveSites;
    delete legacy.bookings[0].lineItems;
    legacy.courses = legacy.courses.filter(
      (c: { id: string }) => c.id !== "fun-dive",
    );
    legacy.activities = legacy.activities.filter(
      (a: { id: string }) => a.id !== "fun-dive-0",
    );
    const migrated = migrateStore(legacy);
    expect(migrated.schemaRevision).toBe(3);
    expect(migrated.bookings[0]).toMatchObject({
      id,
      total: 850000,
      deposit: 85000,
    });
    expect(migrated.payments[0].amount).toBe(85000);
    expect(migrated.bookings[0].lineItems?.[0].kind).toBe("legacy");
    expect(
      migrateStore(migrated).activities.filter((a) => a.id === "fun-dive-0"),
    ).toHaveLength(1);
  });
  it("missing equipment and flagged medical review prevent operational check-in", () => {
    let { state, id } = book();
    state = paidConfirmed(state, id);
    state = reviewDocuments(state, desk, id, false);
    expect(() => advanceBooking(state, desk, id)).toThrow();
    state = reviewDocuments(state, desk, id, true);
    state.equipmentItems
      .filter((x) => x.category === "Mask")
      .forEach((x) => (x.status = "Maintenance"));
    expect(operationalReadiness(state, state.activities[0]).ready).toBe(false);
    expect(() => advanceBooking(state, desk, id)).toThrow("Mask");
  });
});
