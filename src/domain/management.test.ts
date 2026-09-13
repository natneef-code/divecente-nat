import { describe, expect, it } from "vitest";
import { actorFor, type Course } from "./model";
import { createBooking } from "./commands";
import {
  createNotificationPreview,
  duplicateProduct,
  notificationSuggestion,
  saveBoat,
  saveDiveSite,
  saveGeneralSettings,
  saveManagedProduct,
  setNotificationRead,
} from "./management";
import { seed } from "./seed";

const manager = actorFor("manager");
const desk = actorFor("frontdesk");
const customer = actorFor("customer");
const product = (overrides: Partial<Course> = {}): Course => ({
  id: "",
  kind: "course",
  inWater: false,
  includedEquipment: [],
  staffing: {},
  name: "Freediving Fundamentals",
  category: "Fictional specialty",
  description: "A fictional introductory product for manager testing.",
  price: 420000,
  depositBps: 1000,
  durationDays: 2,
  capacity: 6,
  prerequisites: "Demo prerequisite review",
  included: ["Classroom briefing"],
  published: false,
  ...overrides,
});

describe("Phase 4 manager commands", () => {
  it("creates, edits and duplicates products while preserving source state", () => {
    const source = seed();
    let state = saveManagedProduct(source, manager, product());
    expect(source.courses).toHaveLength(4);
    expect(state.courses).toHaveLength(5);
    const created = state.courses.at(-1)!;
    state = saveManagedProduct(state, manager, {
      ...created,
      published: true,
      price: 430000,
    });
    expect(state.courses.at(-1)).toMatchObject({
      id: created.id,
      published: true,
      price: 430000,
    });
    state = duplicateProduct(state, manager, created.id);
    expect(state.courses.at(-1)).toMatchObject({
      name: "Freediving Fundamentals copy",
      published: false,
    });
    expect(state.events[0].action).toBe("Product created");
  });

  it("rejects invalid products, duplicate names and non-manager writes", () => {
    expect(() => saveManagedProduct(seed(), desk, product())).toThrow(
      "Manager",
    );
    expect(() =>
      saveManagedProduct(seed(), manager, product({ name: " " })),
    ).toThrow();
    expect(() =>
      saveManagedProduct(seed(), manager, product({ name: "Open Water" })),
    ).toThrow("already exists");
  });

  it("does not reprice existing booking snapshots after product changes", () => {
    let state = seed();
    state = createBooking(state, customer, {
      activityId: "open-water-0",
      participants: [{ name: "Fictional Diver" }],
      documents: true,
      terms: true,
      prerequisites: true,
      method: "QR",
    }).state;
    state = saveManagedProduct(state, manager, {
      ...state.courses.find((item) => item.id === "open-water")!,
      price: 990000,
    });
    expect(state.bookings[0]).toMatchObject({ total: 850000, deposit: 85000 });
  });

  it("creates and updates dive sites and boats with stable IDs", () => {
    let state = seed();
    state = saveDiveSite(state, manager, {
      id: "",
      name: "Japanese Gardens Demo",
      capacity: 18,
      staffing: {},
      active: true,
      notes: "Fictional site record",
    });
    const site = state.diveSites.at(-1)!;
    state = saveDiveSite(state, manager, { ...site, capacity: 16 });
    expect(state.diveSites.at(-1)).toMatchObject({ id: site.id, capacity: 16 });
    state = saveBoat(state, manager, {
      id: "",
      name: "Ocean Demo",
      capacity: 20,
      active: true,
      notes: "Fictional boat record",
    });
    const boat = state.boats.at(-1)!;
    state = saveBoat(state, manager, { ...boat, active: false });
    expect(state.boats.at(-1)).toMatchObject({ id: boat.id, active: false });
    expect(() => saveBoat(state, desk, boat)).toThrow("Manager");
  });

  it("validates and saves general settings without changing operational settings", () => {
    const source = seed();
    const state = saveGeneralSettings(source, manager, {
      ...source.settings,
      name: "Natneef Diving Demo",
      contactEmail: "ops@example.test",
      bookingPrefix: "DIVE",
      taxPercent: 7,
      defaultDepositBps: 1500,
      channels: ["LINE", "LINE", "WhatsApp"],
    });
    expect(state.settings).toMatchObject({
      name: "Natneef Diving Demo",
      currency: "THB",
      timezone: "Asia/Bangkok",
      defaultDepositBps: 1500,
      defaultStaffingRatio: source.settings.defaultStaffingRatio,
      channels: ["LINE", "WhatsApp"],
    });
    expect(() =>
      saveGeneralSettings(source, manager, {
        ...source.settings,
        contactEmail: "invalid",
      }),
    ).toThrow();
  });

  it("records simulated notification previews and read state without sending", () => {
    let state = seed();
    state = createBooking(state, customer, {
      activityId: "open-water-0",
      participants: [{ name: "Fictional Diver" }],
      documents: true,
      terms: true,
      prerequisites: true,
      method: "QR",
    }).state;
    const bookingId = state.bookings[0].id;
    const message = notificationSuggestion(
      state,
      bookingId,
      "Booking confirmation",
    );
    state = createNotificationPreview(state, manager, {
      bookingId,
      type: "Booking confirmation",
      channels: ["LINE"],
      message,
    });
    expect(state.notifications[0]).toMatchObject({
      bookingId,
      channels: ["Internal", "LINE"],
      simulated: true,
      read: false,
    });
    expect(state.events[0].action).toContain("not sent");
    state = setNotificationRead(
      state,
      manager,
      state.notifications[0].id,
      true,
    );
    expect(state.notifications[0].read).toBe(true);
    expect(() =>
      createNotificationPreview(state, desk, {
        bookingId,
        type: "Booking confirmation",
        channels: ["Internal"],
        message,
      }),
    ).toThrow("Manager");
  });
});
