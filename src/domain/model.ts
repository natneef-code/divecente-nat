export type Role = 'customer' | 'frontdesk' | 'instructor' | 'manager';
export type Actor = { role: Role; id: string; customerId?: string };
export type Status = 'Enquiry' | 'Pending' | 'Awaiting payment' | 'Payment verification' | 'Deposit paid' | 'Confirmed' | 'Checked in' | 'In progress' | 'Completed' | 'Cancelled' | 'Refunded' | 'No-show';
export type Course = { id: string; name: string; category: string; description: string; price: number; depositBps: number; durationDays: number; capacity: number; prerequisites: string; included: string[]; published: boolean };
export type Activity = { id: string; courseId: string; date: string; endDate: string; time: string; site: string; instructorId: string | null; boat: string; capacity: number };
export type Customer = { id: string; name: string; email: string; certification: string; loggedDives: number; createdAt: string; updatedAt: string };
export type Participant = { id: string; name: string; size: string; equipment: 'Included set' | 'Set + computer'; documents: 'Not started' | 'Submitted'; medical: 'Not started' | 'Submitted'; createdAt: string };
export type Booking = { id: string; customerId: string; activityId: string; participants: Participant[]; status: Status; total: number; deposit: number; method: 'QR' | 'Wise'; termsVersion: string; prerequisitesAccepted: boolean; createdAt: string; updatedAt: string; history: { status: Status; at: string }[] };
export type Payment = { id: string; bookingId: string; amount: number; method: 'QR' | 'Wise'; status: 'Pending' | 'Approved' | 'Rejected'; reference: string; createdAt: string; reviewedAt?: string; reviewerId?: string };
export type AuditEvent = { id: string; actorId: string; entityId: string; action: string; at: string };
export type Store = { version: 1; courses: Course[]; activities: Activity[]; customers: Customer[]; bookings: Booking[]; payments: Payment[]; events: AuditEvent[] };
export const roles: { id: Role; name: string; description: string; person: string }[] = [
  { id: 'customer', name: 'Customer', description: 'Find your next course, reserve a place and get ready to dive.', person: 'Alex Morgan' },
  { id: 'frontdesk', name: 'Front Desk', description: 'Follow bookings, verify demo transfers and organize the day.', person: 'Nok' },
  { id: 'instructor', name: 'Instructor', description: 'See assigned sessions, students and preparation status.', person: 'Mali' },
  { id: 'manager', name: 'Manager', description: 'Review bookings, deposits, capacity and daily operations.', person: 'Nat' },
];
export const actorFor = (role: Role): Actor => ({ role, id: role === 'instructor' ? 'instructor-mali' : `user-${role}`, ...(role === 'customer' ? { customerId: 'customer-alex' } : {}) });
export const money = (satang: number) => new Intl.NumberFormat('en-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: satang % 100 ? 2 : 0 }).format(satang / 100);
export const dateLabel = (date: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) => new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'Asia/Bangkok' }).format(new Date(`${date}T12:00:00+07:00`));
export function bangkokDate(now = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now); }
