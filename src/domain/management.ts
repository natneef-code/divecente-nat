import {
  type Actor,
  type Boat,
  type Course,
  type DiveSite,
  type Settings,
  type Store,
  bangkokDate,
} from "./model";
import { event, reserved } from "./commands";
import { assignedIds } from "./policies";

const now = () => new Date().toISOString();
const clean = (value: string, max = 1000) => value.trim().slice(0, max);
const requireManager = (actor: Actor) => {
  if (actor.role !== "manager")
    throw new Error("Permission denied: Manager required.");
};
const slug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

export function saveManagedProduct(
  source: Store,
  actor: Actor,
  input: Course,
): Store {
  requireManager(actor);
  if (
    input.name.trim().length < 2 ||
    input.description.trim().length < 10 ||
    input.category.trim().length < 2 ||
    input.prerequisites.trim().length < 2 ||
    !Number.isSafeInteger(input.price) ||
    input.price < 0 ||
    !Number.isInteger(input.depositBps) ||
    input.depositBps < 0 ||
    input.depositBps > 10000 ||
    !Number.isInteger(input.durationDays) ||
    input.durationDays < 1 ||
    input.durationDays > 31 ||
    !Number.isInteger(input.capacity) ||
    input.capacity < 1 ||
    input.capacity > 100
  )
    throw new Error(
      "Complete the product details with valid price and limits.",
    );
  const state = structuredClone(source);
  const existing = state.courses.find((course) => course.id === input.id);
  const baseId = slug(input.name);
  const id =
    existing?.id || `${baseId || "product"}-${crypto.randomUUID().slice(0, 6)}`;
  if (
    state.courses.some(
      (course) =>
        course.id !== id &&
        course.name.toLowerCase() === input.name.trim().toLowerCase(),
    )
  )
    throw new Error("A product with this name already exists.");
  if (
    existing &&
    state.activities.some(
      (activity) =>
        activity.courseId === existing.id &&
        reserved(state, activity.id) > input.capacity,
    )
  )
    throw new Error("Capacity cannot be below existing reservations.");
  const product: Course = {
    ...input,
    id,
    name: clean(input.name, 80),
    category: clean(input.category, 100),
    description: clean(input.description),
    prerequisites: clean(input.prerequisites),
    included: [
      ...new Set(
        input.included.map((item) => clean(item, 100)).filter(Boolean),
      ),
    ],
    includedEquipment: [...new Set(input.includedEquipment || [])],
    staffing: input.staffing || {},
  };
  if (existing) Object.assign(existing, product);
  else state.courses.push(product);
  event(state, actor, id, existing ? "Product updated" : "Product created");
  return state;
}

export function duplicateProduct(
  source: Store,
  actor: Actor,
  productId: string,
): Store {
  requireManager(actor);
  const sourceProduct = source.courses.find(
    (course) => course.id === productId,
  );
  if (!sourceProduct) throw new Error("Product not found.");
  return saveManagedProduct(source, actor, {
    ...structuredClone(sourceProduct),
    id: "",
    name: `${sourceProduct.name} copy`,
    published: false,
  });
}

export function saveDiveSite(
  source: Store,
  actor: Actor,
  input: DiveSite,
): Store {
  requireManager(actor);
  if (
    input.name.trim().length < 2 ||
    !Number.isInteger(input.capacity) ||
    input.capacity < 1 ||
    input.capacity > 500
  )
    throw new Error("Enter a site name and participant capacity from 1–500.");
  const state = structuredClone(source);
  const existing = state.diveSites.find((site) => site.id === input.id);
  const id =
    existing?.id ||
    `site-${slug(input.name)}-${crypto.randomUUID().slice(0, 5)}`;
  if (
    state.diveSites.some(
      (site) =>
        site.id !== id &&
        site.name.toLowerCase() === input.name.trim().toLowerCase(),
    )
  )
    throw new Error("A dive site with this name already exists.");
  const record: DiveSite = {
    ...input,
    id,
    name: clean(input.name, 100),
    notes: clean(input.notes || ""),
    active: input.active ?? true,
    staffing: input.staffing || {},
  };
  if (existing) Object.assign(existing, record);
  else state.diveSites.push(record);
  event(state, actor, id, existing ? "Dive site updated" : "Dive site created");
  return state;
}

export function saveBoat(source: Store, actor: Actor, input: Boat): Store {
  requireManager(actor);
  if (
    input.name.trim().length < 2 ||
    !Number.isInteger(input.capacity) ||
    input.capacity < 1 ||
    input.capacity > 500
  )
    throw new Error("Enter a boat name and passenger capacity from 1–500.");
  const state = structuredClone(source);
  const existing = state.boats.find((boat) => boat.id === input.id);
  const id =
    existing?.id ||
    `boat-${slug(input.name)}-${crypto.randomUUID().slice(0, 5)}`;
  if (
    state.boats.some(
      (boat) =>
        boat.id !== id &&
        boat.name.toLowerCase() === input.name.trim().toLowerCase(),
    )
  )
    throw new Error("A boat with this name already exists.");
  if (
    existing &&
    state.boatManifests.some(
      (manifest) =>
        manifest.boatId === existing.id &&
        manifest.seats.some((seat) => seat.seat > input.capacity),
    )
  )
    throw new Error("Existing manifest seats exceed the new boat capacity.");
  if (
    existing &&
    state.boatManifests
      .filter((manifest) => manifest.boatId === existing.id)
      .some((manifest) => {
        const activity = state.activities.find(
          (row) => row.id === manifest.activityId,
        );
        if (!activity) return false;
        const participants = manifest.bookingIds.reduce((total, bookingId) => {
          const booking = state.bookings.find((row) => row.id === bookingId);
          return total + (booking?.participants.length ?? 0);
        }, 0);
        return (
          participants + assignedIds(state, activity).length > input.capacity
        );
      })
  )
    throw new Error(
      "Existing manifest occupancy exceeds the new boat capacity.",
    );
  const capacityChanged = !!existing && existing.capacity !== input.capacity;
  const record: Boat = {
    ...input,
    id,
    name: clean(input.name, 100),
    notes: clean(input.notes || ""),
    active: input.active ?? true,
    unavailableSeats: (
      input.unavailableSeats ??
      existing?.unavailableSeats ??
      []
    ).filter((seat) => seat <= input.capacity),
  };
  if (existing) Object.assign(existing, record);
  else state.boats.push(record);
  event(
    state,
    actor,
    id,
    capacityChanged
      ? `Boat passenger capacity changed to ${input.capacity}`
      : existing
        ? "Boat updated"
        : "Boat created",
  );
  return state;
}

export function saveGeneralSettings(
  source: Store,
  actor: Actor,
  input: Settings,
): Store {
  requireManager(actor);
  if (
    input.name.trim().length < 2 ||
    input.language.trim().length < 2 ||
    (input.contactEmail && !/^\S+@\S+\.\S+$/.test(input.contactEmail)) ||
    !Number.isInteger(input.defaultDepositBps) ||
    input.defaultDepositBps < 0 ||
    input.defaultDepositBps > 10000 ||
    !Number.isFinite(input.taxPercent ?? 0) ||
    (input.taxPercent ?? 0) < 0 ||
    (input.taxPercent ?? 0) > 100 ||
    !/^[A-Z0-9-]{2,10}$/.test(input.bookingPrefix || "NAT")
  )
    throw new Error(
      "Check the organization, contact, deposit, tax and booking-prefix fields.",
    );
  const state = structuredClone(source);
  state.settings = {
    ...state.settings,
    ...input,
    name: clean(input.name, 100),
    language: clean(input.language, 40),
    contactEmail: clean(input.contactEmail || "", 120),
    contactPhone: clean(input.contactPhone || "", 60),
    bookingPrefix: clean(input.bookingPrefix || "NAT", 10).toUpperCase(),
    currency: "THB",
    timezone: "Asia/Bangkok",
    channels: [...new Set(input.channels)],
  };
  event(state, actor, "settings", "General system settings updated");
  return state;
}

const notificationTypes = [
  "Booking confirmation",
  "Deposit reminder",
  "Outstanding balance reminder",
  "Course reminder",
  "Missing documents",
  "Schedule change",
  "Cancellation",
  "Equipment return",
  "Training update",
] as const;
export type NotificationType = (typeof notificationTypes)[number];
export const allowedNotificationTypes = [...notificationTypes];
export const allowedNotificationChannels = [
  "Internal",
  "LINE",
  "WhatsApp",
  "Facebook",
  "Instagram",
] as const;

export function createNotificationPreview(
  source: Store,
  actor: Actor,
  input: {
    bookingId: string;
    type: NotificationType;
    channels: string[];
    message: string;
  },
): Store {
  requireManager(actor);
  const booking = source.bookings.find((item) => item.id === input.bookingId);
  if (
    !booking ||
    !notificationTypes.includes(input.type) ||
    !input.channels.length ||
    input.channels.some(
      (channel) => !allowedNotificationChannels.includes(channel as never),
    ) ||
    input.message.trim().length < 5 ||
    input.message.trim().length > 500
  )
    throw new Error(
      "Choose a booking, notification type, channels and message preview.",
    );
  const state = structuredClone(source);
  state.notifications.unshift({
    id: crypto.randomUUID(),
    bookingId: booking.id,
    customerId: booking.customerId,
    type: input.type,
    channels: [...new Set(["Internal", ...input.channels])],
    message: clean(input.message, 500),
    createdAt: now(),
    read: false,
    simulated: true,
  });
  event(state, actor, booking.id, `${input.type} preview created; not sent`);
  return state;
}

export function setNotificationRead(
  source: Store,
  actor: Actor,
  id: string | "all",
  read: boolean,
): Store {
  requireManager(actor);
  const state = structuredClone(source);
  const records =
    id === "all"
      ? state.notifications
      : state.notifications.filter((item) => item.id === id);
  if (!records.length) throw new Error("Notification preview not found.");
  records.forEach((item) => (item.read = read));
  event(
    state,
    actor,
    id,
    `Notification preview marked ${read ? "read" : "unread"}`,
  );
  return state;
}

export function notificationSuggestion(
  state: Store,
  bookingId: string,
  type: NotificationType,
) {
  const booking = state.bookings.find((item) => item.id === bookingId);
  const activity = state.activities.find(
    (item) => item.id === booking?.activityId,
  );
  const product = state.courses.find((item) => item.id === activity?.courseId);
  const customer = state.customers.find(
    (item) => item.id === booking?.customerId,
  );
  const name = customer?.preferredName || customer?.name || "Demo diver";
  const date = activity?.date || bangkokDate();
  const templates: Record<NotificationType, string> = {
    "Booking confirmation": `${name}, your fictional ${product?.name || "activity"} booking is recorded for ${date}.`,
    "Deposit reminder": `${name}, your fictional booking still needs its demo deposit. No real payment is requested.`,
    "Outstanding balance reminder": `${name}, your fictional ${product?.name || "activity"} booking has a demo balance to review.`,
    "Course reminder": `${name}, this is a simulated reminder for ${product?.name || "your activity"} on ${date}.`,
    "Missing documents": `${name}, your fictional booking has placeholder documents to complete before check-in.`,
    "Schedule change": `${name}, the fictional schedule for ${product?.name || "your activity"} has changed.`,
    Cancellation: `${name}, your fictional booking cancellation has been recorded.`,
    "Equipment return": `${name}, this is a simulated reminder to return allocated demo equipment.`,
    "Training update": `${name}, your fictional internal training progress has been updated.`,
  };
  return templates[type];
}
