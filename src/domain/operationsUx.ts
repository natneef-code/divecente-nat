import type { Actor, BoatManifest, EquipmentItem, Store } from "./model";
import { event } from "./commands";
import {
  assignedIds,
  occupancy,
  sessionsFor,
  staffingSummary,
} from "./policies";

const editor = (actor: Actor) => {
  if (!["frontdesk", "manager"].includes(actor.role))
    throw new Error("Permission denied: Front Desk or Manager required.");
};
const manager = (actor: Actor) => {
  if (actor.role !== "manager")
    throw new Error("Permission denied: Manager required.");
};
const safeCode = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "-");

export function itemOperationalStatus(store: Store, item: EquipmentItem) {
  const allocation = store.allocations.find(
    (row) => row.itemId === item.id && row.status !== "Returned",
  );
  return allocation?.status ?? item.status;
}

export function equipmentSummary(
  store: Store,
  category?: string,
  size?: string,
) {
  const rows = store.equipmentItems.filter(
    (item) =>
      (!category || item.category === category) &&
      (!size || item.size === size),
  );
  const count = (status: string) =>
    rows.filter((item) => itemOperationalStatus(store, item) === status).length;
  return {
    total: rows.length,
    available: count("Available"),
    reserved: count("Reserved"),
    checkedOut: count("Checked out"),
    maintenance: count("Maintenance"),
    damaged: count("Damaged"),
    outOfService: rows.filter((item) =>
      ["Lost", "Retired"].includes(item.status),
    ).length,
  };
}

export function bulkCreateEquipment(
  source: Store,
  actor: Actor,
  input: Pick<EquipmentItem, "category" | "size" | "brand" | "model"> & {
    prefix: string;
    start: number;
    count: number;
  },
) {
  manager(actor);
  if (!input.category.trim() || !input.size.trim() || !safeCode(input.prefix))
    throw new Error("Category, size and asset-code prefix are required.");
  if (
    !Number.isInteger(input.start) ||
    input.start < 1 ||
    !Number.isInteger(input.count) ||
    input.count < 1 ||
    input.count > 100
  )
    throw new Error("Create 1–100 assets using a positive starting number.");
  const store = structuredClone(source);
  const now = new Date().toISOString();
  const codes = Array.from(
    { length: input.count },
    (_, index) =>
      `${safeCode(input.prefix)}-${String(input.start + index).padStart(3, "0")}`,
  );
  if (
    codes.some((code) => store.equipmentItems.some((item) => item.id === code))
  )
    throw new Error("One or more sequential asset codes already exist.");
  const maintenance = new Date();
  maintenance.setUTCFullYear(maintenance.getUTCFullYear() + 1);
  for (const code of codes)
    store.equipmentItems.push({
      id: code,
      category: input.category.trim(),
      size: input.size.trim(),
      brand: input.brand.trim() || "Demo",
      model: input.model.trim() || "Training series",
      serial: `FICTIONAL-${code}`,
      status: "Available",
      lastInspection: now.slice(0, 10),
      nextMaintenance: maintenance.toISOString().slice(0, 10),
      damageNotes: "",
      createdAt: now,
      updatedAt: now,
    });
  event(
    store,
    actor,
    codes[0],
    `Bulk-created ${codes.length} individually tracked equipment assets (${codes[0]}–${codes.at(-1)})`,
  );
  return store;
}

export function dailyCoverage(store: Store, activityId: string) {
  const activity = store.activities.find((row) => row.id === activityId);
  if (!activity) throw new Error("Activity not found.");
  const sessions = sessionsFor(store, activity);
  return sessions.map((session) => {
    const summary = staffingSummary(store, activity, session);
    return {
      session,
      participants: occupancy(store, activity.id),
      ...summary,
      status:
        summary.missing > 0 ||
        summary.issues.some((issue) =>
          /Instructor|required|conflict/i.test(issue),
        )
          ? ("Blocked" as const)
          : summary.issues.length
            ? ("Warning" as const)
            : ("Ready" as const),
    };
  });
}

export function manifestFor(
  store: Store,
  activityId: string,
  boatId?: string,
): BoatManifest {
  const activity = store.activities.find((row) => row.id === activityId);
  if (!activity) throw new Error("Activity not found.");
  const targetBoat =
    boatId ??
    activity.boatId ??
    store.boats.find((boat) => boat.name === activity.boat)?.id;
  if (!targetBoat) throw new Error("Boat not found.");
  return (
    store.boatManifests.find(
      (row) => row.activityId === activityId && row.boatId === targetBoat,
    ) ?? {
      id: `manifest-${activityId}-${targetBoat}`,
      activityId,
      boatId: targetBoat,
      bookingIds: store.bookings
        .filter(
          (booking) =>
            booking.activityId === activityId &&
            !["Cancelled", "Refunded", "No-show"].includes(booking.status),
        )
        .map((booking) => booking.id),
      seats: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
}

export function manifestOccupants(store: Store, manifest: BoatManifest) {
  const participants = manifest.bookingIds.flatMap((bookingId) => {
    const booking = store.bookings.find((row) => row.id === bookingId);
    return (booking?.participants ?? []).map((participant) => ({
      id: participant.id,
      name: participant.name,
      type: "participant" as const,
      bookingId,
    }));
  });
  const activity = store.activities.find(
    (row) => row.id === manifest.activityId,
  )!;
  const professionals = assignedIds(store, activity).map((id) => ({
    id,
    name: store.staffMembers.find((member) => member.id === id)?.name ?? id,
    type: "professional" as const,
  }));
  return [...participants, ...professionals];
}

function saveManifest(store: Store, manifest: BoatManifest) {
  const index = store.boatManifests.findIndex((row) => row.id === manifest.id);
  manifest.updatedAt = new Date().toISOString();
  if (index < 0) store.boatManifests.push(manifest);
  else store.boatManifests[index] = manifest;
}

export function addManifestGroup(
  source: Store,
  actor: Actor,
  activityId: string,
  boatId: string,
  bookingId: string,
) {
  editor(actor);
  const store = structuredClone(source);
  const booking = store.bookings.find(
    (row) => row.id === bookingId && row.activityId === activityId,
  );
  if (!booking || ["Cancelled", "Refunded", "No-show"].includes(booking.status))
    throw new Error("Active booking group not found.");
  const manifest = structuredClone(manifestFor(store, activityId, boatId));
  for (const other of store.boatManifests.filter(
    (row) => row.activityId === activityId,
  )) {
    other.bookingIds = other.bookingIds.filter((id) => id !== bookingId);
    const participantIds = booking.participants.map(
      (participant) => participant.id,
    );
    other.seats = other.seats.filter(
      (seat) => !participantIds.includes(seat.occupantId),
    );
  }
  if (!manifest.bookingIds.includes(bookingId))
    manifest.bookingIds.push(bookingId);
  const boat = store.boats.find((row) => row.id === boatId);
  if (!boat) throw new Error("Boat not found.");
  if (manifestOccupants(store, manifest).length > boat.capacity)
    throw new Error("Boat capacity would be exceeded.");
  saveManifest(store, manifest);
  event(
    store,
    actor,
    manifest.id,
    `Booking group ${bookingId} added or moved to ${boat.name}`,
  );
  return store;
}

export function removeManifestGroup(
  source: Store,
  actor: Actor,
  manifestId: string,
  bookingId: string,
) {
  editor(actor);
  const store = structuredClone(source);
  const manifest = store.boatManifests.find((row) => row.id === manifestId);
  if (!manifest || !manifest.bookingIds.includes(bookingId))
    throw new Error("Manifest booking group not found.");
  const participantIds =
    store.bookings
      .find((row) => row.id === bookingId)
      ?.participants.map((row) => row.id) ?? [];
  manifest.bookingIds = manifest.bookingIds.filter((id) => id !== bookingId);
  manifest.seats = manifest.seats.filter(
    (row) => !participantIds.includes(row.occupantId),
  );
  saveManifest(store, manifest);
  event(
    store,
    actor,
    manifest.id,
    `Booking group ${bookingId} removed from boat manifest`,
  );
  return store;
}

export function assignManifestSeat(
  source: Store,
  actor: Actor,
  manifestId: string,
  occupantId: string,
  seat: number,
) {
  editor(actor);
  const store = structuredClone(source);
  const manifest = store.boatManifests.find((row) => row.id === manifestId);
  if (!manifest) throw new Error("Boat manifest not found.");
  const boat = store.boats.find((row) => row.id === manifest.boatId)!;
  if (!Number.isInteger(seat) || seat < 1 || seat > boat.capacity)
    throw new Error(`Seat must be between 1 and ${boat.capacity}.`);
  if (boat.unavailableSeats?.includes(seat))
    throw new Error("That seat is operationally unavailable.");
  const occupant = manifestOccupants(store, manifest).find(
    (row) => row.id === occupantId,
  );
  if (!occupant) throw new Error("Passenger is not part of this manifest.");
  if (
    manifest.seats.some(
      (row) => row.seat === seat && row.occupantId !== occupantId,
    )
  )
    throw new Error("That seat is already assigned.");
  const existing = manifest.seats.find((row) => row.occupantId === occupantId);
  const previous = existing?.seat;
  if (existing) existing.seat = seat;
  else manifest.seats.push({ occupantId, occupantType: occupant.type, seat });
  saveManifest(store, manifest);
  event(
    store,
    actor,
    manifest.id,
    `Seat ${previous ? `${previous} changed to ` : ""}${seat} assigned to ${occupantId}`,
  );
  return store;
}

export function setBoatSeatUnavailable(
  source: Store,
  actor: Actor,
  boatId: string,
  seat: number,
  unavailable: boolean,
) {
  editor(actor);
  const store = structuredClone(source);
  const boat = store.boats.find((row) => row.id === boatId);
  if (
    !boat ||
    !Number.isInteger(seat) ||
    seat < 1 ||
    seat > (boat?.capacity ?? 0)
  )
    throw new Error("Seat is outside the configured boat range.");
  if (
    unavailable &&
    store.boatManifests.some(
      (manifest) =>
        manifest.boatId === boatId &&
        manifest.seats.some((row) => row.seat === seat),
    )
  )
    throw new Error("Release the confirmed passenger seat before blocking it.");
  boat.unavailableSeats = unavailable
    ? [...new Set([...(boat.unavailableSeats ?? []), seat])].sort(
        (a, b) => a - b,
      )
    : (boat.unavailableSeats ?? []).filter((value) => value !== seat);
  event(
    store,
    actor,
    boatId,
    `Seat ${seat} ${unavailable ? "blocked" : "released"}`,
  );
  return store;
}

export function suggestConsecutiveSeats(
  store: Store,
  manifest: BoatManifest,
  bookingId: string,
) {
  const boat = store.boats.find((row) => row.id === manifest.boatId)!;
  const booking = store.bookings.find((row) => row.id === bookingId);
  if (!booking) return [];
  const unseated = booking.participants.filter(
    (person) => !manifest.seats.some((seat) => seat.occupantId === person.id),
  );
  const unavailable = new Set([
    ...(boat.unavailableSeats ?? []),
    ...manifest.seats.map((row) => row.seat),
  ]);
  for (let start = 1; start <= boat.capacity - unseated.length + 1; start++) {
    const seats = Array.from(
      { length: unseated.length },
      (_, index) => start + index,
    );
    if (seats.every((seat) => !unavailable.has(seat)))
      return unseated.map((person, index) => ({
        occupantId: person.id,
        seat: seats[index],
      }));
  }
  return [];
}

export function applySeatSuggestions(
  source: Store,
  actor: Actor,
  manifestId: string,
  bookingId: string,
) {
  editor(actor);
  let store = structuredClone(source);
  const manifest = store.boatManifests.find((row) => row.id === manifestId);
  if (!manifest) throw new Error("Boat manifest not found.");
  const suggestions = suggestConsecutiveSeats(store, manifest, bookingId);
  if (!suggestions.length)
    throw new Error(
      "No consecutive seats are available for unassigned group members.",
    );
  for (const suggestion of suggestions)
    store = assignManifestSeat(
      store,
      actor,
      manifestId,
      suggestion.occupantId,
      suggestion.seat,
    );
  event(
    store,
    actor,
    manifestId,
    `Confirmed consecutive seat suggestions for booking group ${bookingId}`,
  );
  return store;
}

export function updateBoatCapacity(
  source: Store,
  actor: Actor,
  boatId: string,
  capacity: number,
) {
  manager(actor);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500)
    throw new Error("Boat capacity must be between 1 and 500.");
  const store = structuredClone(source);
  const boat = store.boats.find((row) => row.id === boatId);
  if (!boat) throw new Error("Boat not found.");
  if (
    store.boatManifests.some(
      (manifest) =>
        manifest.boatId === boatId &&
        manifest.seats.some((seat) => seat.seat > capacity),
    )
  )
    throw new Error("Existing seat assignments exceed the new capacity.");
  if (
    store.boatManifests
      .filter((manifest) => manifest.boatId === boatId)
      .some((manifest) => manifestOccupants(store, manifest).length > capacity)
  )
    throw new Error("Existing manifest occupancy exceeds the new capacity.");
  boat.capacity = capacity;
  boat.unavailableSeats = (boat.unavailableSeats ?? []).filter(
    (seat) => seat <= capacity,
  );
  event(store, actor, boatId, `Boat passenger capacity changed to ${capacity}`);
  return store;
}
