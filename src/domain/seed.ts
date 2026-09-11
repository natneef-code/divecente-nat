import { operationsSeed } from "./records";
import { bangkokDate, type Store } from "./model";
export function seed(now = new Date()): Store {
  const today = bangkokDate(now);
  const day = (offset: number) => {
    const d = new Date(`${today}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  const timestamp = now.toISOString();
  return {
    ...operationsSeed(now),
    version: 1,
    courses: [
      {
        id: "open-water",
        name: "Open Water",
        category: "Your first certification course",
        description:
          "Start a lifelong connection with the ocean. Build confidence in the pool, then explore the reefs with a small group and your instructor.",
        price: 850000,
        depositBps: 1000,
        durationDays: 3,
        capacity: 4,
        prerequisites:
          "Demo assumption: age 15+, comfortable swimming, and medical-declaration review before in-water training.",
        included: [
          "Core rental equipment",
          "Pool practice",
          "Four open-water dives",
          "Small-group instruction",
        ],
        published: true,
      },
      {
        id: "advanced",
        name: "Advanced",
        category: "Your next adventure",
        description:
          "Explore new environments and build on your experience with a guided series of adventure dives.",
        price: 950000,
        depositBps: 1000,
        durationDays: 2,
        capacity: 4,
        prerequisites:
          "Demo assumption: Open Water certification or equivalent; instructor review required.",
        included: [
          "Core rental equipment",
          "Five guided training dives",
          "Small-group instruction",
        ],
        published: true,
      },
      {
        id: "nitrox",
        name: "Nitrox Specialty",
        category: "Expand your knowledge",
        description:
          "Learn the planning and practical considerations of enriched-air diving in a focused small-group workshop.",
        price: 350000,
        depositBps: 1000,
        durationDays: 1,
        capacity: 4,
        prerequisites:
          "Demo assumption: Open Water certification or equivalent; instructor review required.",
        included: [
          "Equipment workshop",
          "Gas-analysis practice",
          "Small-group instruction",
        ],
        published: true,
      },
    ],
    activities: ["open-water", "advanced", "nitrox"].flatMap((courseId, c) =>
      [2, 7, 14].map((offset, i) => ({
        id: `${courseId}-${i}`,
        courseId,
        date: day(offset + c),
        endDate: day(offset + c + (c === 0 ? 2 : c === 1 ? 1 : 0)),
        time: "09:00",
        site:
          c === 0
            ? "Mae Haad pool & Koh Tao reefs"
            : c === 1
              ? "Koh Tao dive sites"
              : "Natneef classroom",
        instructorId:
          i === 2
            ? null
            : ["instructor-mali", "instructor-ben", "instructor-lin"][c],
        boat: c === 2 ? "Shore-based" : c === 0 ? "Blue Current" : "Sea Willow",
        capacity: 4,
      })),
    ),
    customers: [
      {
        id: "customer-alex",
        name: "Alex Morgan",
        email: "alex@example.test",
        certification: "New diver",
        loggedDives: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    bookings: [],
    payments: [],
    events: [],
  };
}
