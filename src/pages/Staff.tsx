import { BookingOperations } from "./BookingOperations";
import { Refreshers } from "./Staffing";
import {
  hasAssignment,
  isProfessional,
  effectiveRules,
  operationalReadiness,
  assignedIds,
} from "../domain/policies";
import { staffName } from "../domain/operations";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  CalendarDays,
  Users,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useStore } from "../data/store";
import {
  advanceBooking,
  balance,
  canRead,
  paid,
  reserved,
  verifyPayment,
} from "../domain/commands";
import { bangkokDate, dateLabel, money, type Store } from "../domain/model";
import { Badge, Empty, Notice, PageTitle } from "../ui";
export function Staff() {
  const { state, actor, update } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const instructor = !!actor && isProfessional(actor);
  const bookings = state.bookings.filter(
    (b) => actor && canRead(state, actor, b),
  );
  const filtered = bookings.filter((b) => {
    const a = state.activities.find((a) => a.id === b.activityId);
    const c = state.courses.find((c) => c.id === a?.courseId);
    return (
      (status === "all" || b.status === status) &&
      `${b.id} ${c?.name} ${b.participants.map((p) => p.name).join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  });
  function run(
    fn: (s: Store, a: NonNullable<typeof actor>) => Store,
    message: string,
  ) {
    setError("");
    setSuccess("");
    try {
      update((s, a) => ({ state: fn(s, a), result: undefined }));
      setSuccess(message);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <main className="container section">
      <PageTitle
        eyebrow={
          instructor ? "DIVE PROFESSIONAL WORKSPACE" : "DAILY OPERATIONS"
        }
        title={
          instructor
            ? "Your students, your next dives."
            : "A clear view of every booking."
        }
        description={
          instructor
            ? "Assigned rosters and preparation status. Financial information is excluded from this workspace."
            : "Follow each reservation from first deposit to check-in. All transactions below are fictional."
        }
        action={
          <Link to="/app/calendar" className="button secondary">
            <CalendarDays size={17} /> Open calendar
          </Link>
        }
      />
      <Notice />
      {!instructor && (
        <div className="stat-grid">
          <div>
            <span>Bookings</span>
            <strong>{bookings.length}</strong>
          </div>
          <div>
            <span>Demo deposits received</span>
            <strong>
              {money(bookings.reduce((n, b) => n + paid(state, b.id), 0))}
            </strong>
          </div>
          <div>
            <span>Outstanding balances</span>
            <strong>
              {money(bookings.reduce((n, b) => n + balance(state, b), 0))}
            </strong>
          </div>
          <div>
            <span>Pending transfer reviews</span>
            <strong>
              {state.payments.filter((p) => p.status === "Pending").length}
            </strong>
          </div>
        </div>
      )}
      <div className="filter-bar">
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Search bookings"
            placeholder="Search student, course or booking…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="inline-label">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {Array.from(new Set(bookings.map((b) => b.status))).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="success" role="status">
          {success}
        </p>
      )}
      {filtered.length === 0 ? (
        <Empty
          title={
            bookings.length ? "No matching bookings." : "No bookings here yet."
          }
        >
          {bookings.length
            ? "Try another search or status filter."
            : "Create a booking as Customer, then return to this workspace in the same browser."}{" "}
          <Link to="/demo">Switch role →</Link>
        </Empty>
      ) : (
        filtered.map((b) => {
          const a = state.activities.find((a) => a.id === b.activityId)!;
          const c = state.courses.find((c) => c.id === a.courseId)!;
          return (
            <article className="panel staff-booking" key={b.id}>
              <div className="panel-heading">
                <div>
                  <div className="eyebrow">
                    {b.id.slice(0, 8).toUpperCase()} · {dateLabel(a.date)} ·{" "}
                    {a.time}
                  </div>
                  <h2>{c.name}</h2>
                </div>
                <Badge>{instructor ? "Assigned" : b.status}</Badge>
              </div>
              <div className="roster">
                {b.participants.map((p) => (
                  <div key={p.id}>
                    <span className="avatar">{p.name[0]}</span>
                    <span>
                      <strong>{p.name}</strong>
                      <small>{p.equipment}</small>
                      {p.certification && (
                        <small>
                          {p.certification.agency} · {p.certification.level} ·{" "}
                          {p.certification.number} ·{" "}
                          {p.certification.loggedDives} logged dives · last dive{" "}
                          {p.certification.lastDive}
                        </small>
                      )}
                    </span>
                    <Badge>
                      {p.documents === "Submitted"
                        ? "Acknowledged"
                        : "Documents missing"}
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="muted">
                {a.site} · Instructor:{" "}
                {assignedIds(state, a)
                  .map((id) => staffName(state, id))
                  .join(", ") || "Unassigned"}{" "}
                · Acknowledgements do not establish medical clearance.
              </p>
              {!instructor && (
                <>
                  <div className="staff-finance">
                    <span>
                      Total <strong>{money(b.total)}</strong>
                    </span>
                    <span>
                      Received <strong>{money(paid(state, b.id))}</strong>
                    </span>
                    <span>
                      Balance <strong>{money(balance(state, b))}</strong>
                    </span>
                    {["Deposit paid", "Confirmed"].includes(b.status) && (
                      <button
                        className="small"
                        onClick={() =>
                          run(
                            (s, a) => advanceBooking(s, a, b.id),
                            b.status === "Deposit paid"
                              ? "Booking confirmed."
                              : "Demo group checked in.",
                          )
                        }
                      >
                        {b.status === "Deposit paid"
                          ? "Confirm booking"
                          : "Check in group"}{" "}
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                  {state.payments
                    .filter((p) => p.bookingId === b.id)
                    .map((p) => (
                      <div className="payment-row" key={p.id}>
                        <div>
                          <strong>
                            {p.method} · {money(p.amount)}
                          </strong>
                          <small>
                            {p.reference} · mock proof / transaction
                          </small>
                        </div>
                        <Badge>{p.status}</Badge>
                        {p.status === "Pending" && (
                          <div className="actions compact">
                            <button
                              className="small"
                              onClick={() =>
                                run(
                                  (s, a) => verifyPayment(s, a, p.id, true),
                                  "Demo transfer approved; deposit and balance updated.",
                                )
                              }
                            >
                              Approve demo transfer
                            </button>
                            <button
                              className="small secondary"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Reject this fictional transfer? The customer can resubmit.",
                                  )
                                )
                                  run(
                                    (s, a) => verifyPayment(s, a, p.id, false),
                                    "Demo transfer rejected.",
                                  );
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </>
              )}
              {!instructor && <BookingOperations booking={b} />}
              <Refreshers booking={b} />
              {instructor && b.status === "Confirmed" && (
                <button
                  onClick={() =>
                    run(
                      (s, a) => advanceBooking(s, a, b.id),
                      "Demo group checked in.",
                    )
                  }
                >
                  Assist with check-in
                </button>
              )}
              {instructor && (
                <p>
                  <Link to="/app/equipment">Fit & assign equipment</Link>
                  {actor?.role === "instructor" && c.kind !== "fun-dive" && (
                    <>
                      {" "}
                      · <Link to="/app/training">Update training</Link>
                    </>
                  )}
                </p>
              )}
            </article>
          );
        })
      )}
    </main>
  );
}
export function Calendar() {
  const { state, actor } = useStore();
  const [view, setView] = useState<"list" | "daily" | "weekly" | "month">(
    "list",
  );
  const [date, setDate] = useState(state.activities[0]?.date || bangkokDate());
  const [course, setCourse] = useState("all");
  const end = new Date(`${date}T12:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 6);
  const endDate = end.toISOString().slice(0, 10);
  const monthStart = `${date.slice(0, 7)}-01`;
  const monthEndDate = new Date(`${monthStart}T12:00:00Z`);
  monthEndDate.setUTCMonth(monthEndDate.getUTCMonth() + 1);
  monthEndDate.setUTCDate(0);
  const monthEnd = monthEndDate.toISOString().slice(0, 10);
  const activities = state.activities
    .filter(
      (a) =>
        (!actor ||
          !isProfessional(actor) ||
          hasAssignment(state, actor, a.id)) &&
        (course === "all" || a.courseId === course) &&
        (view === "list" ||
          (view === "daily"
            ? a.date <= date && a.endDate >= date
            : view === "weekly"
              ? a.date <= endDate && a.endDate >= date
              : a.date <= monthEnd && a.endDate >= monthStart)),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  return (
    <main className="container section">
      <PageTitle
        eyebrow="NATNEEF DIVING · ASIA/BANGKOK"
        title="The plan, all in one place."
        description="Course blocks include every day from start to finish. Student counts update from the same booking records."
      />
      <div className="filter-bar calendar-filters">
        <div className="segmented" aria-label="Calendar view">
          {(["daily", "weekly", "month", "list"] as const).map((v) => (
            <button
              key={v}
              className={view === v ? "active" : ""}
              onClick={() => setView(v)}
              aria-pressed={view === v}
            >
              {v === "daily"
                ? "Day"
                : v === "weekly"
                  ? "Week"
                  : v === "month"
                    ? "Month"
                    : "List"}
            </button>
          ))}
        </div>
        {view !== "list" && (
          <label className="inline-label">
            {view === "weekly"
              ? "From date"
              : view === "month"
                ? "Month containing"
                : "Date"}
            <input
              type="date"
              value={date}
              required
              onChange={(e) => {
                if (e.target.value) setDate(e.target.value);
              }}
            />
          </label>
        )}
        <label className="inline-label">
          Course
          <select value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="all">All courses</option>
            {state.courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {view === "month" ? (
        <MonthCalendar
          state={state}
          activities={activities}
          monthStart={monthStart}
          onDay={(day) => {
            setDate(day);
            setView("daily");
          }}
        />
      ) : activities.length === 0 ? (
        <Empty title="A quiet day on the calendar.">
          No activities match this view. Try another date or course.
        </Empty>
      ) : (
        <div className="calendar-list">
          {activities.map((a) => {
            const c = state.courses.find((c) => c.id === a.courseId)!;
            const bookings = state.bookings.filter(
              (b) =>
                b.activityId === a.id &&
                !["Cancelled", "Refunded", "No-show"].includes(b.status),
            );
            const count = reserved(state, a.id);
            const missing = bookings
              .flatMap((b) => b.participants)
              .filter((p) => p.documents !== "Submitted").length;
            return (
              <article key={a.id} className="calendar-item">
                <div className="calendar-date">
                  <strong>{dateLabel(a.date, { day: "2-digit" })}</strong>
                  <span>{dateLabel(a.date, { month: "short" })}</span>
                  <small>{a.time}</small>
                </div>
                <div className="calendar-content">
                  <div className="panel-heading">
                    <div>
                      <div className="eyebrow">
                        {c.durationDays}-DAY COURSE BLOCK
                      </div>
                      <h2>{c.name}</h2>
                    </div>
                    <Badge>{`${count} / ${effectiveRules(state, a).capacity} ${c.kind === "fun-dive" ? "divers" : "students"}`}</Badge>
                  </div>
                  <p>
                    {dateLabel(a.date)} – {dateLabel(a.endDate)} · {a.site}
                  </p>
                  <div className="calendar-meta">
                    <span>
                      <Users size={15} />{" "}
                      {assignedIds(state, a)
                        .map((id) => staffName(state, id))
                        .join(", ") || "Unassigned professional"}
                    </span>
                    <span>{a.boat}</span>
                  </div>
                  <div className="capacity-bar">
                    <span
                      style={{
                        width: `${Math.min(100, (count / effectiveRules(state, a).capacity) * 100)}%`,
                      }}
                    />
                  </div>
                  {bookings.length > 0 && (
                    <div className="calendar-roster">
                      {bookings
                        .flatMap((b) => b.participants)
                        .map((p) => (
                          <span key={p.id}>{p.name}</span>
                        ))}
                    </div>
                  )}
                  <p>
                    Staffing: {operationalReadiness(state, a).assigned} assigned
                    / {operationalReadiness(state, a).required} required ·{" "}
                    {operationalReadiness(state, a).ready
                      ? "Coverage ready"
                      : "Readiness review needed"}
                    .{" "}
                    <Link to="/app/staffing">Review staffing & Refreshers</Link>
                  </p>
                  {(missing > 0 ||
                    !a.instructorId ||
                    count > effectiveRules(state, a).capacity) && (
                    <div className="calendar-alert">
                      <AlertCircle size={15} />
                      {[
                        missing > 0
                          ? `${missing} missing document acknowledgements`
                          : "",
                        !a.instructorId ? "Instructor assignment needed" : "",
                        count > effectiveRules(state, a).capacity
                          ? "Over capacity"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
      <p className="muted">
        Review session coverage, Instructor/Divemaster overlap, boat and
        equipment conflicts in Staffing. Assignment is always manual.
      </p>
    </main>
  );
}

function MonthCalendar({
  state,
  activities,
  monthStart,
  onDay,
}: {
  state: Store;
  activities: Store["activities"];
  monthStart: string;
  onDay: (day: string) => void;
}) {
  const first = new Date(`${monthStart}T12:00:00Z`);
  const offset = (first.getUTCDay() + 6) % 7;
  first.setUTCDate(first.getUTCDate() - offset);
  const days = Array.from({ length: 42 }, (_, index) => {
    const value = new Date(first);
    value.setUTCDate(value.getUTCDate() + index);
    return value.toISOString().slice(0, 10);
  });
  return (
    <section
      className="month-calendar"
      aria-label={`Month calendar ${monthStart.slice(0, 7)}`}
    >
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
        <strong className="month-weekday" key={label}>
          {label}
        </strong>
      ))}
      {days.map((day) => {
        const dayActivities = activities.filter(
          (activity) => activity.date <= day && activity.endDate >= day,
        );
        return (
          <div
            className={`month-day ${day.slice(0, 7) !== monthStart.slice(0, 7) ? "outside" : ""}`}
            key={day}
          >
            <button
              className="month-date"
              onClick={() => onDay(day)}
              aria-label={`Open ${dateLabel(day)}`}
            >
              {Number(day.slice(-2))}
            </button>
            {dayActivities.map((activity) => {
              const product = state.courses.find(
                (course) => course.id === activity.courseId,
              )!;
              const ready = operationalReadiness(state, activity);
              const status = ready.ready
                ? "Ready"
                : ready.assigned
                  ? "Warning"
                  : "Blocked";
              return (
                <Link
                  className={`month-activity ${status.toLowerCase()}`}
                  to={`/app/staffing?activity=${activity.id}`}
                  key={activity.id}
                >
                  <strong>{product.name}</strong>
                  <small>
                    {reserved(state, activity.id)} people · {ready.assigned}/
                    {ready.required} pros · {status}
                  </small>
                </Link>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}
