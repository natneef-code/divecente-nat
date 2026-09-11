export type Role = "customer" | "frontdesk" | "instructor" | "manager";
export type Actor = { role: Role; id: string; customerId?: string };
export type Status =
  | "Enquiry"
  | "Pending"
  | "Awaiting payment"
  | "Payment verification"
  | "Deposit paid"
  | "Confirmed"
  | "Checked in"
  | "In progress"
  | "Completed"
  | "Cancelled"
  | "Refunded"
  | "No-show";
export type Course = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  depositBps: number;
  durationDays: number;
  capacity: number;
  prerequisites: string;
  included: string[];
  published: boolean;
};
export type Activity = {
  id: string;
  courseId: string;
  date: string;
  endDate: string;
  time: string;
  site: string;
  instructorId: string | null;
  boat: string;
  capacity: number;
};
export type Customer = {
  id: string;
  name: string;
  email: string;
  certification: string;
  loggedDives: number;
  preferredName?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  language?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  certificationOrg?: string;
  certificationNumber?: string;
  lastDive?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
export type Participant = {
  id: string;
  name: string;
  size: string;
  equipment: "Included set" | "Set + computer";
  documents: "Not started" | "Submitted";
  medical: MedicalStatus;
  createdAt: string;
};
export type Booking = {
  id: string;
  customerId: string;
  activityId: string;
  participants: Participant[];
  status: Status;
  total: number;
  deposit: number;
  method: "QR" | "Wise";
  termsVersion: string;
  prerequisitesAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  history: { status: Status; at: string }[];
};
export type Payment = {
  id: string;
  bookingId: string;
  amount: number;
  method: "QR" | "Wise" | "Manual";
  status: "Pending" | "Approved" | "Rejected";
  reference: string;
  createdAt: string;
  reviewedAt?: string;
  reviewerId?: string;
};
export type AuditEvent = {
  id: string;
  actorId: string;
  entityId: string;
  action: string;
  at: string;
};
export type Store = {
  version: 1;
  courses: Course[];
  activities: Activity[];
  customers: Customer[];
  bookings: Booking[];
  payments: Payment[];
  events: AuditEvent[];
  schemaRevision: 2;
  staffMembers: StaffMember[];
  enquiries: Enquiry[];
  documents: DocumentRecord[];
  enrolments: Enrolment[];
  equipmentItems: EquipmentItem[];
  allocations: Allocation[];
  maintenance: MaintenanceRecord[];
  notifications: NotificationEvent[];
  refunds: Refund[];
  settings: Settings;
};
export const roles: {
  id: Role;
  name: string;
  description: string;
  person: string;
}[] = [
  {
    id: "customer",
    name: "Customer",
    description:
      "Find your next course, reserve a place and get ready to dive.",
    person: "Alex Morgan",
  },
  {
    id: "frontdesk",
    name: "Front Desk",
    description: "Follow bookings, verify demo transfers and organize the day.",
    person: "Nok",
  },
  {
    id: "instructor",
    name: "Instructor",
    description: "See assigned sessions, students and preparation status.",
    person: "Mali",
  },
  {
    id: "manager",
    name: "Manager",
    description: "Review bookings, deposits, capacity and daily operations.",
    person: "Nat",
  },
];
export const actorFor = (role: Role): Actor => ({
  role,
  id: role === "instructor" ? "instructor-mali" : `user-${role}`,
  ...(role === "customer" ? { customerId: "customer-alex" } : {}),
});
export const money = (satang: number) =>
  new Intl.NumberFormat("en-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: satang % 100 ? 2 : 0,
  }).format(satang / 100);
export const dateLabel = (
  date: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
) =>
  new Intl.DateTimeFormat("en-GB", {
    ...options,
    timeZone: "Asia/Bangkok",
  }).format(new Date(`${date}T12:00:00+07:00`));
export function bangkokDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export type MedicalStatus =
  "Not started" | "Submitted" | "Review required" | "Cleared" | "Expired";
export type StaffMember = {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  active: boolean;
  qualifiedCourseIds: string[];
  qualificationExpiry: string;
  availableFrom: string;
  availableTo: string;
  createdAt: string;
  updatedAt: string;
};
export type Enquiry = {
  id: string;
  name: string;
  email: string;
  courseId: string;
  message: string;
  status: "New" | "Contacted" | "Converted" | "Closed";
  customerId?: string;
  createdAt: string;
  updatedAt: string;
};
export type DocumentRecord = {
  id: string;
  bookingId: string;
  participantId: string;
  type: string;
  status:
    "Not started" | "Submitted" | "Approved" | "Review required" | "Expired";
  version: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewerId?: string;
  expiry?: string;
  notes: string;
};
export const trainingStates = [
  "Enrolled",
  "Scheduled",
  "In training",
  "Additional training required",
  "Training complete",
  "Ready for SSI processing",
  "Processed externally",
] as const;
export type TrainingStatus = (typeof trainingStates)[number];
export type Enrolment = {
  id: string;
  bookingId: string;
  participantId: string;
  status: TrainingStatus;
  attendance: boolean[];
  milestones: boolean[];
  notes: string;
  updatedAt: string;
};
export type EquipmentItem = {
  id: string;
  category: string;
  brand: string;
  model: string;
  size: string;
  serial: string;
  status: "Available" | "Maintenance" | "Damaged" | "Lost" | "Retired";
  lastInspection: string;
  nextMaintenance: string;
  damageNotes: string;
  createdAt: string;
  updatedAt: string;
};
export type Allocation = {
  id: string;
  itemId: string;
  bookingId: string;
  participantId: string;
  activityId: string;
  status: "Reserved" | "Checked out" | "Returned";
  createdAt: string;
  returnedAt?: string;
};
export type MaintenanceRecord = {
  id: string;
  itemId: string;
  date: string;
  notes: string;
  nextDue: string;
  actorId: string;
};
export type NotificationEvent = {
  id: string;
  bookingId?: string;
  customerId?: string;
  type: string;
  message: string;
  channels: string[];
  createdAt: string;
  read: boolean;
  simulated: true;
};
export type Refund = {
  id: string;
  bookingId: string;
  amount: number;
  reason: string;
  actorId: string;
  createdAt: string;
};
export type Settings = {
  name: string;
  currency: "THB";
  timezone: "Asia/Bangkok";
  language: string;
  defaultDepositBps: number;
  channels: string[];
};
