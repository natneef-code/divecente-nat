import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileWarning,
  Mail,
  MapPin,
  Ship,
  Users,
} from "lucide-react";
import { useStore } from "../data/store";
import {
  type Boat,
  type Course,
  type DiveSite,
  type Settings,
  bangkokDate,
  dateLabel,
  money,
} from "../domain/model";
import { balance, paid } from "../domain/commands";
import {
  allowedNotificationChannels,
  allowedNotificationTypes,
  createNotificationPreview,
  duplicateProduct,
  notificationSuggestion,
  saveBoat,
  saveDiveSite,
  saveGeneralSettings,
  saveManagedProduct,
  setNotificationRead,
  type NotificationType,
} from "../domain/management";
import { Badge, Empty, PageTitle } from "../ui";
import { Denied, Field, useAction } from "./operation-ui";

const activeStatuses = [
  "Awaiting payment",
  "Payment verification",
  "Deposit paid",
  "Confirmed",
  "Checked in",
  "In progress",
];
const today = () => bangkokDate();
const managerOnly = (role?: string) => role === "manager";

export function ManagerDashboard() {
  const { state, actor } = useStore();
  if (!managerOnly(actor?.role)) return <Denied />;
  const day = today();
  const active = state.bookings.filter((booking) =>
    activeStatuses.includes(booking.status),
  );
  const upcoming = active.filter((booking) => {
    const activity = state.activities.find(
      (item) => item.id === booking.activityId,
    );
    return !!activity && activity.date >= day;
  });
  const todayActivities = state.activities.filter(
    (activity) => activity.date <= day && activity.endDate >= day,
  );
  const missingDocuments = active.reduce(
    (count, booking) =>
      count +
      booking.participants.filter(
        (participant) =>
          participant.documents !== "Submitted" ||
          participant.medical === "Review required" ||
          participant.medical === "Expired",
      ).length,
    0,
  );
  const received = state.bookings.reduce(
    (total, booking) => total + paid(state, booking.id),
    0,
  );
  const outstanding = active.reduce(
    (total, booking) => total + balance(state, booking),
    0,
  );
  const recent = state.events.slice(0, 8);
  return (
    <main className="container section">
      <PageTitle
        eyebrow={`MANAGER DASHBOARD · ${dateLabel(day)}`}
        title="The business, at a glance."
        description="Live fictional demo totals from this browser. Staffing and equipment-dependent dashboard widgets are pending user-approved UX revision."
        action={
          <div className="actions">
            <Link className="button secondary" to="/app/calendar">
              <CalendarDays size={17} /> Open calendar
            </Link>
            <Link className="button" to="/app/mvp-reports">
              Open reports <ArrowRight size={17} />
            </Link>
          </div>
        }
      />
      <div className="metric-grid">
        <article className="metric-card">
          <Clock3 />
          <span>Today’s activities</span>
          <strong>{todayActivities.length}</strong>
          <small>Across published demo schedules</small>
        </article>
        <article className="metric-card">
          <BookOpen />
          <span>Upcoming bookings</span>
          <strong>{upcoming.length}</strong>
          <small>
            {active.reduce((n, b) => n + b.participants.length, 0)} active
            participants
          </small>
        </article>
        <article className="metric-card">
          <Users />
          <span>Students in training</span>
          <strong>
            {
              state.enrolments.filter(
                (item) => !["Processed externally"].includes(item.status),
              ).length
            }
          </strong>
          <small>
            {state.enquiries.filter((item) => item.status === "New").length} new
            enquiries
          </small>
        </article>
        <article className="metric-card">
          <CircleDollarSign />
          <span>Demo payments received</span>
          <strong>{money(received)}</strong>
          <small>{money(outstanding)} active balance</small>
        </article>
        <article className="metric-card">
          <FileWarning />
          <span>Document attention</span>
          <strong>{missingDocuments}</strong>
          <small>Submission or review outstanding</small>
        </article>
        <article className="metric-card">
          <Bell />
          <span>Unread previews</span>
          <strong>
            {state.notifications.filter((item) => !item.read).length}
          </strong>
          <small>Simulated; nothing was sent</small>
        </article>
        <article className="metric-card">
          <CircleDollarSign />
          <span>Pending transfer reviews</span>
          <strong>
            {
              state.payments.filter((payment) => payment.status === "Pending")
                .length
            }
          </strong>
          <small>Manual payment verification queue</small>
        </article>
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Upcoming booking pipeline</h2>
            <Link to="/app/reports">View report</Link>
          </div>
          {upcoming.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Date</th>
                    <th>People</th>
                    <th>Status</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.slice(0, 6).map((booking) => {
                    const activity = state.activities.find(
                      (item) => item.id === booking.activityId,
                    )!;
                    const product = state.courses.find(
                      (item) => item.id === activity.courseId,
                    )!;
                    return (
                      <tr key={booking.id}>
                        <td>
                          <strong>{product.name}</strong>
                          <small>{booking.id.slice(0, 8).toUpperCase()}</small>
                        </td>
                        <td>{dateLabel(activity.date)}</td>
                        <td>{booking.participants.length}</td>
                        <td>
                          <Badge>{booking.status}</Badge>
                        </td>
                        <td>{money(balance(state, booking))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="No upcoming bookings">
              New bookings will appear here.
            </Empty>
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Recent business activity</h2>
            <Link to="/app/audit">Full audit</Link>
          </div>
          {recent.length ? (
            <div className="timeline-list">
              {recent.map((item) => (
                <div key={item.id}>
                  <span className="timeline-dot" />
                  <p>
                    <strong>{item.action}</strong>
                    <small>
                      {new Date(item.at).toLocaleString("en-GB", {
                        timeZone: "Asia/Bangkok",
                      })}{" "}
                      · {item.actorId}
                    </small>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No business activity recorded yet.</p>
          )}
        </section>
      </div>
      <section className="panel deferred-panel">
        <h2>Pending user-approved UX revision</h2>
        <p>
          Equipment and maintenance UI, Operations Calendar month view, staffing
          assignment, Activity default team, readiness/workload indicators, and
          dependent dashboard widgets remain unchanged while feedback is
          finalized.
        </p>
      </section>
    </main>
  );
}

export function MvpReports() {
  const { state, actor } = useStore();
  const [productId, setProduct] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  if (!managerOnly(actor?.role)) return <Denied />;
  const rows = state.bookings.filter((booking) => {
    const activity = state.activities.find(
      (item) => item.id === booking.activityId,
    );
    return (
      !!activity &&
      (productId === "all" || activity.courseId === productId) &&
      (status === "all" || booking.status === status) &&
      (!from || activity.date >= from) &&
      (!to || activity.date <= to)
    );
  });
  const received = rows.reduce((n, booking) => n + paid(state, booking.id), 0);
  const outstanding = rows.reduce(
    (n, booking) => n + balance(state, booking),
    0,
  );
  const booked = rows.reduce((n, booking) => n + booking.total, 0);
  const participants = rows.reduce(
    (n, booking) => n + booking.participants.length,
    0,
  );
  const deposits = rows.reduce(
    (n, booking) => n + Math.min(booking.deposit, paid(state, booking.id)),
    0,
  );
  const byProduct = state.courses.map((product) => {
    const productRows = rows.filter(
      (booking) =>
        state.activities.find((activity) => activity.id === booking.activityId)
          ?.courseId === product.id,
    );
    return {
      product,
      bookings: productRows.length,
      participants: productRows.reduce(
        (n, booking) => n + booking.participants.length,
        0,
      ),
      booked: productRows.reduce((n, booking) => n + booking.total, 0),
      received: productRows.reduce(
        (n, booking) => n + paid(state, booking.id),
        0,
      ),
    };
  });
  return (
    <main className="container section">
      <PageTitle
        eyebrow="MVP REPORTS"
        title="Useful numbers, clear limits."
        description="Filters recalculate from fictional booking snapshots. Revenue means recorded demo payments, not bank settlement or accounting revenue."
      />
      <div className="filter-bar report-filters">
        <Field label="Report product" value={productId} onChange={setProduct}>
          <option value="all">All products</option>
          {state.courses.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </Field>
        <Field label="Booking status" value={status} onChange={setStatus}>
          <option value="all">All statuses</option>
          {[...new Set(state.bookings.map((booking) => booking.status))].map(
            (value) => (
              <option key={value}>{value}</option>
            ),
          )}
        </Field>
        <Field label="From date" value={from} onChange={setFrom} type="date" />
        <Field label="To date" value={to} onChange={setTo} type="date" />
      </div>
      <div className="metric-grid compact-metrics">
        <article className="metric-card">
          <BookOpen />
          <span>Bookings</span>
          <strong>{rows.length}</strong>
          <small>{participants} participants</small>
        </article>
        <article className="metric-card">
          <CircleDollarSign />
          <span>Booked value</span>
          <strong>{money(booked)}</strong>
          <small>Immutable booking snapshots</small>
        </article>
        <article className="metric-card">
          <CheckCircle2 />
          <span>Deposits received</span>
          <strong>{money(deposits)}</strong>
          <small>Approved demo records</small>
        </article>
        <article className="metric-card">
          <CircleDollarSign />
          <span>Payments received</span>
          <strong>{money(received)}</strong>
          <small>{money(outstanding)} outstanding</small>
        </article>
      </div>
      <section className="panel">
        <h2>Product performance</h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Bookings</th>
                <th>Participants</th>
                <th>Booked value</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {byProduct.map(({ product, ...values }) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    <small>{product.published ? "Published" : "Draft"}</small>
                  </td>
                  <td>{values.bookings}</td>
                  <td>{values.participants}</td>
                  <td>{money(values.booked)}</td>
                  <td>{money(values.received)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <h2>Booking detail</h2>
        {rows.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Product / date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Received</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((booking) => {
                  const activity = state.activities.find(
                    (item) => item.id === booking.activityId,
                  )!;
                  const product = state.courses.find(
                    (item) => item.id === activity.courseId,
                  )!;
                  return (
                    <tr key={booking.id}>
                      <td>{booking.id.slice(0, 8).toUpperCase()}</td>
                      <td>
                        <strong>{product.name}</strong>
                        <small>{dateLabel(activity.date)}</small>
                      </td>
                      <td>
                        <Badge>{booking.status}</Badge>
                      </td>
                      <td>{money(booking.total)}</td>
                      <td>{money(paid(state, booking.id))}</td>
                      <td>{money(balance(state, booking))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No report rows">
            Adjust the report filters to include bookings.
          </Empty>
        )}
      </section>
    </main>
  );
}

const blankCourse = (): Course => ({
  id: "",
  kind: "course",
  inWater: true,
  includedEquipment: [],
  staffing: {},
  name: "",
  category: "Course",
  description: "",
  price: 0,
  depositBps: 1000,
  durationDays: 1,
  capacity: 4,
  prerequisites: "Operator review required",
  included: [],
  published: false,
});

function ProductEditor({
  initial,
  onDone,
}: {
  initial: Course;
  onDone: (message: string) => void;
}) {
  const [form, setForm] = useState(structuredClone(initial));
  const { run, feedback } = useAction();
  const [included, setIncluded] = useState(form.included.join("\n"));
  return (
    <form
      className="panel"
      onSubmit={(event) => {
        event.preventDefault();
        const result = run(
          (state, actor) =>
            saveManagedProduct(state, actor, {
              ...form,
              included: included
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            }),
          form.id ? "Product updated." : "Product created.",
        );
        if (result) onDone(form.id ? "Product updated." : "Product created.");
      }}
    >
      <div className="panel-heading">
        <h2>{form.id ? `Edit ${form.name}` : "Create product"}</h2>
        <Badge>{form.published ? "Published" : "Draft"}</Badge>
      </div>
      <div className="form-grid">
        <Field
          label="Product name"
          value={form.name}
          onChange={(name) => setForm({ ...form, name })}
          required
        />
        <Field
          label="Product type"
          value={form.kind || "course"}
          onChange={(kind) =>
            setForm({ ...form, kind: kind as Course["kind"] })
          }
        >
          <option value="course">Course</option>
          <option value="fun-dive">Fun Dive</option>
        </Field>
        <Field
          label="Catalogue category"
          value={form.category}
          onChange={(category) => setForm({ ...form, category })}
          required
        />
        <Field
          label="Price THB"
          value={form.price / 100}
          onChange={(value) =>
            setForm({ ...form, price: Math.round(Number(value) * 100) })
          }
          type="number"
          min={0}
          step="0.01"
          required
        />
        <Field
          label="Deposit percent"
          value={form.depositBps / 100}
          onChange={(value) =>
            setForm({ ...form, depositBps: Math.round(Number(value) * 100) })
          }
          type="number"
          min={0}
          max={100}
          step="0.01"
          required
        />
        <Field
          label="Duration days"
          value={form.durationDays}
          onChange={(value) =>
            setForm({ ...form, durationDays: Number(value) })
          }
          type="number"
          min={1}
          max={31}
          required
        />
        <Field
          label="Participant maximum"
          value={form.capacity}
          onChange={(value) => setForm({ ...form, capacity: Number(value) })}
          type="number"
          min={1}
          max={100}
          required
        />
      </div>
      <Field
        label="Public description"
        value={form.description}
        onChange={(description) => setForm({ ...form, description })}
        type="textarea"
        required
      />
      <Field
        label="Prerequisites"
        value={form.prerequisites}
        onChange={(prerequisites) => setForm({ ...form, prerequisites })}
        type="textarea"
        required
      />
      <Field
        label="Included items — one per line"
        value={included}
        onChange={setIncluded}
        type="textarea"
      />
      <div className="actions">
        <label className="check-row">
          <input
            type="checkbox"
            checked={!!form.inWater}
            onChange={(event) =>
              setForm({ ...form, inWater: event.target.checked })
            }
          />
          Contains in-water training
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(event) =>
              setForm({ ...form, published: event.target.checked })
            }
          />
          Published in catalogue
        </label>
      </div>
      {feedback}
      <button>{form.id ? "Save product" : "Create draft product"}</button>
    </form>
  );
}

export function ProductManagement() {
  const { state, actor } = useStore();
  const { run, feedback } = useAction();
  const [selected, setSelected] = useState<string | "new" | null>(null);
  const [notice, setNotice] = useState("");
  if (!managerOnly(actor?.role)) return <Denied />;
  const current =
    selected && selected !== "new"
      ? state.courses.find((item) => item.id === selected)
      : undefined;
  return (
    <main className="container section">
      <PageTitle
        eyebrow="PRODUCT & COURSE MANAGEMENT"
        title="Shape what customers can book."
        description="Create and edit catalogue products, prices, deposits, inclusions and publication state. Existing bookings retain their financial snapshots."
        action={
          <button
            onClick={() => {
              setNotice("");
              setSelected("new");
            }}
          >
            Create product
          </button>
        }
      />
      {feedback}
      {notice && (
        <p className="success" role="status">
          {notice}
        </p>
      )}
      {selected ? (
        <ProductEditor
          key={selected}
          initial={current || blankCourse()}
          onDone={(message) => {
            setNotice(message);
            setSelected(null);
          }}
        />
      ) : (
        <section className="panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Deposit</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.courses.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      <small>{product.category}</small>
                    </td>
                    <td>
                      {product.kind === "fun-dive" ? "Fun Dive" : "Course"}
                    </td>
                    <td>{money(product.price)}</td>
                    <td>{product.depositBps / 100}%</td>
                    <td>{product.capacity}</td>
                    <td>
                      <Badge>{product.published ? "Published" : "Draft"}</Badge>
                    </td>
                    <td>
                      <div className="actions compact">
                        <button
                          className="small secondary"
                          onClick={() => setSelected(product.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="small secondary"
                          onClick={() =>
                            run(
                              (s, a) => duplicateProduct(s, a, product.id),
                              "Draft copy created.",
                            )
                          }
                        >
                          Duplicate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

const blankSite = (): DiveSite => ({
  id: "",
  name: "",
  capacity: 12,
  staffing: {},
  active: true,
  notes: "",
});
const blankBoat = (): Boat => ({
  id: "",
  name: "",
  capacity: 12,
  active: true,
  notes: "",
});

export function ResourceManagement() {
  const { state, actor } = useStore();
  const { run, feedback } = useAction();
  const [site, setSite] = useState<DiveSite | null>(null);
  const [boat, setBoat] = useState<Boat | null>(null);
  if (!managerOnly(actor?.role)) return <Denied />;
  return (
    <main className="container section">
      <PageTitle
        eyebrow="DIVE SITES & BOATS"
        title="Keep operational resources clear."
        description="Manage names, capacities, availability and operational notes. Staffing-specific controls remain pending user-approved UX revision."
      />
      {feedback}
      <div className="resource-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <MapPin />
              <h2>Dive sites</h2>
            </div>
            <button className="small" onClick={() => setSite(blankSite())}>
              Add site
            </button>
          </div>
          {state.diveSites.map((item) => (
            <div className="resource-row" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <small>
                  Maximum {item.capacity} participants ·{" "}
                  {(item.active ?? true) ? "Active" : "Inactive"}
                </small>
                <p>{item.notes || "No operational notes."}</p>
              </div>
              <button
                className="small secondary"
                onClick={() => setSite(structuredClone(item))}
              >
                Edit
              </button>
            </div>
          ))}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <Ship />
              <h2>Boats</h2>
            </div>
            <button className="small" onClick={() => setBoat(blankBoat())}>
              Add boat
            </button>
          </div>
          {state.boats.map((item) => (
            <div className="resource-row" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <small>
                  Maximum {item.capacity} passengers ·{" "}
                  {(item.active ?? true) ? "Active" : "Inactive"}
                </small>
                <p>{item.notes || "No operational notes."}</p>
              </div>
              <button
                className="small secondary"
                onClick={() => setBoat(structuredClone(item))}
              >
                Edit
              </button>
            </div>
          ))}
        </section>
      </div>
      {site && (
        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault();
            if (
              run(
                (s, a) => saveDiveSite(s, a, site),
                site.id ? "Dive site updated." : "Dive site created.",
              )
            )
              setSite(null);
          }}
        >
          <h2>{site.id ? "Edit dive site" : "Add dive site"}</h2>
          <div className="form-grid">
            <Field
              label="Dive site name"
              value={site.name}
              onChange={(name) => setSite({ ...site, name })}
              required
            />
            <Field
              label="Site participant capacity"
              value={site.capacity}
              onChange={(value) =>
                setSite({ ...site, capacity: Number(value) })
              }
              type="number"
              min={1}
              max={500}
              required
            />
          </div>
          <Field
            label="Dive site operational notes"
            value={site.notes || ""}
            onChange={(notes) => setSite({ ...site, notes })}
            type="textarea"
          />
          <label className="check-row">
            <input
              type="checkbox"
              checked={site.active ?? true}
              onChange={(event) =>
                setSite({ ...site, active: event.target.checked })
              }
            />
            Active for future scheduling
          </label>
          <div className="actions">
            <button>Save dive site</button>
            <button
              className="secondary"
              type="button"
              onClick={() => setSite(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {boat && (
        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault();
            if (
              run(
                (s, a) => saveBoat(s, a, boat),
                boat.id ? "Boat updated." : "Boat created.",
              )
            )
              setBoat(null);
          }}
        >
          <h2>{boat.id ? "Edit boat" : "Add boat"}</h2>
          <div className="form-grid">
            <Field
              label="Boat name"
              value={boat.name}
              onChange={(name) => setBoat({ ...boat, name })}
              required
            />
            <Field
              label="Boat passenger capacity"
              value={boat.capacity}
              onChange={(value) =>
                setBoat({ ...boat, capacity: Number(value) })
              }
              type="number"
              min={1}
              max={500}
              required
            />
          </div>
          <Field
            label="Boat operational notes"
            value={boat.notes || ""}
            onChange={(notes) => setBoat({ ...boat, notes })}
            type="textarea"
          />
          <label className="check-row">
            <input
              type="checkbox"
              checked={boat.active ?? true}
              onChange={(event) =>
                setBoat({ ...boat, active: event.target.checked })
              }
            />
            Active for future scheduling
          </label>
          <div className="actions">
            <button>Save boat</button>
            <button
              className="secondary"
              type="button"
              onClick={() => setBoat(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

export function SystemSettings() {
  const { state, actor } = useStore();
  const { run, feedback } = useAction();
  const [form, setForm] = useState<Settings>(structuredClone(state.settings));
  if (!managerOnly(actor?.role)) return <Denied />;
  return (
    <main className="container section">
      <PageTitle
        eyebrow="GENERAL SYSTEM SETTINGS"
        title="The defaults behind the demo."
        description="Organization and booking defaults apply to future records. THB and Asia/Bangkok remain fixed for this Natneef Diving MVP."
      />
      <form
        className="panel"
        onSubmit={(event) => {
          event.preventDefault();
          run(
            (s, a) => saveGeneralSettings(s, a, form),
            "General settings saved.",
          );
        }}
      >
        <div className="form-grid">
          <Field
            label="Organization name"
            value={form.name}
            onChange={(name) => setForm({ ...form, name })}
            required
          />
          <Field
            label="Contact email"
            value={form.contactEmail || ""}
            onChange={(contactEmail) => setForm({ ...form, contactEmail })}
            type="email"
          />
          <Field
            label="Contact phone"
            value={form.contactPhone || ""}
            onChange={(contactPhone) => setForm({ ...form, contactPhone })}
          />
          <Field
            label="Default language"
            value={form.language}
            onChange={(language) => setForm({ ...form, language })}
            required
          />
          <Field
            label="Booking reference prefix"
            value={form.bookingPrefix || "NAT"}
            onChange={(bookingPrefix) =>
              setForm({ ...form, bookingPrefix: bookingPrefix.toUpperCase() })
            }
            required
          />
          <Field
            label="Default deposit percent"
            value={form.defaultDepositBps / 100}
            onChange={(value) =>
              setForm({
                ...form,
                defaultDepositBps: Math.round(Number(value) * 100),
              })
            }
            type="number"
            min={0}
            max={100}
            step="0.01"
            required
          />
          <Field
            label="Tax percent — demo assumption"
            value={form.taxPercent || 0}
            onChange={(value) =>
              setForm({ ...form, taxPercent: Number(value) })
            }
            type="number"
            min={0}
            max={100}
            step="0.01"
          />
          <Field label="Currency" value={form.currency} onChange={() => {}}>
            <option>THB</option>
          </Field>
          <Field label="Time zone" value={form.timezone} onChange={() => {}}>
            <option>Asia/Bangkok</option>
          </Field>
        </div>
        <fieldset>
          <legend>Prepared simulated channels</legend>
          <p className="muted">
            Configuration enables previews only. No provider is connected and no
            message will be sent.
          </p>
          {["LINE", "WhatsApp", "Facebook", "Instagram"].map((channel) => (
            <label className="check-row" key={channel}>
              <input
                type="checkbox"
                checked={form.channels.includes(channel)}
                onChange={(event) =>
                  setForm({
                    ...form,
                    channels: event.target.checked
                      ? [...form.channels, channel]
                      : form.channels.filter((item) => item !== channel),
                  })
                }
              />
              {channel} · simulated
            </label>
          ))}
        </fieldset>
        {feedback}
        <button>Save general settings</button>
      </form>
      <section className="panel deferred-panel">
        <h2>Pending user-approved UX revision</h2>
        <p>
          Staffing defaults, equipment package configuration, readiness settings
          and related workflow presentation remain on their existing screen and
          are not redesigned in this checkpoint.
        </p>
      </section>
    </main>
  );
}

export function NotificationCenter() {
  const { state, actor } = useStore();
  const { run, feedback } = useAction();
  const [bookingId, setBooking] = useState(state.bookings[0]?.id || "");
  const [type, setType] = useState<NotificationType>("Booking confirmation");
  const [channels, setChannels] = useState<string[]>(["Internal"]);
  const [message, setMessage] = useState(() =>
    bookingId ? notificationSuggestion(state, bookingId, type) : "",
  );
  const [filter, setFilter] = useState("all");
  if (!managerOnly(actor?.role)) return <Denied />;
  const updateTemplate = (nextBooking: string, nextType: NotificationType) => {
    setBooking(nextBooking);
    setType(nextType);
    if (nextBooking)
      setMessage(notificationSuggestion(state, nextBooking, nextType));
  };
  const records = state.notifications.filter(
    (item) =>
      filter === "all" ||
      (filter === "unread" ? !item.read : item.type === filter),
  );
  return (
    <main className="container section">
      <PageTitle
        eyebrow="INTERNAL NOTIFICATION CENTER"
        title="Preview every message before providers exist."
        description="All entries are internal simulations. LINE, WhatsApp, Facebook and Instagram are preparation targets only; nothing is sent."
      />
      <div className="dashboard-grid">
        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault();
            run(
              (s, a) =>
                createNotificationPreview(s, a, {
                  bookingId,
                  type,
                  channels,
                  message,
                }),
              "Simulated notification preview recorded. Nothing was sent.",
            );
          }}
        >
          <h2>Create preview</h2>
          {state.bookings.length ? (
            <>
              <Field
                label="Notification booking"
                value={bookingId}
                onChange={(value) => updateTemplate(value, type)}
                required
              >
                {state.bookings.map((booking) => {
                  const activity = state.activities.find(
                    (item) => item.id === booking.activityId,
                  );
                  const product = state.courses.find(
                    (item) => item.id === activity?.courseId,
                  );
                  const customer = state.customers.find(
                    (item) => item.id === booking.customerId,
                  );
                  return (
                    <option key={booking.id} value={booking.id}>
                      {customer?.name} · {product?.name} ·{" "}
                      {booking.id.slice(0, 8)}
                    </option>
                  );
                })}
              </Field>
              <Field
                label="Notification event"
                value={type}
                onChange={(value) =>
                  updateTemplate(bookingId, value as NotificationType)
                }
              >
                {allowedNotificationTypes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Field>
              <fieldset>
                <legend>Preview channels</legend>
                {allowedNotificationChannels.map((channel) => (
                  <label className="check-row" key={channel}>
                    <input
                      type="checkbox"
                      disabled={channel === "Internal"}
                      checked={channels.includes(channel)}
                      onChange={(event) =>
                        setChannels(
                          event.target.checked
                            ? [...channels, channel]
                            : channels.filter((item) => item !== channel),
                        )
                      }
                    />
                    {channel}
                    {channel !== "Internal" && " · simulated"}
                  </label>
                ))}
              </fieldset>
              <Field
                label="Message preview"
                value={message}
                onChange={setMessage}
                type="textarea"
                required
              />
              {feedback}
              <button>
                <Mail size={17} /> Record preview — do not send
              </button>
            </>
          ) : (
            <Empty title="No booking recipients">
              Create a fictional booking before preparing a preview.
            </Empty>
          )}
        </form>
        <section className="panel preview-card">
          <div className="eyebrow">MESSAGE PREVIEW · NOT SENT</div>
          <h2>{type}</h2>
          <p>{message || "Your preview will appear here."}</p>
          <p className="muted">
            Channels: {channels.join(", ")} · Simulated providers only
          </p>
        </section>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <h2>Notification history</h2>
          {state.notifications.length > 0 && (
            <button
              className="small secondary"
              onClick={() =>
                run(
                  (s, a) => setNotificationRead(s, a, "all", true),
                  "All previews marked read.",
                )
              }
            >
              Mark all read
            </button>
          )}
        </div>
        <Field label="Notification filter" value={filter} onChange={setFilter}>
          <option value="all">All previews</option>
          <option value="unread">Unread</option>
          {allowedNotificationTypes.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Field>
        {records.length ? (
          <div className="notification-list">
            {records.map((item) => (
              <article key={item.id}>
                <div>
                  <div className="eyebrow">
                    {item.channels.join(" · ")} · NOT SENT
                  </div>
                  <h3>{item.type}</h3>
                  <p>{item.message}</p>
                  <small>
                    {new Date(item.createdAt).toLocaleString("en-GB", {
                      timeZone: "Asia/Bangkok",
                    })}
                  </small>
                </div>
                <div>
                  <Badge>{item.read ? "Read" : "Unread"}</Badge>
                  <button
                    className="small secondary"
                    onClick={() =>
                      run(
                        (s, a) =>
                          setNotificationRead(s, a, item.id, !item.read),
                        `Preview marked ${item.read ? "unread" : "read"}.`,
                      )
                    }
                  >
                    Mark {item.read ? "unread" : "read"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Empty title="No notification previews">
            Create a simulated preview to see it here.
          </Empty>
        )}
      </section>
    </main>
  );
}

export function AuditHistory() {
  const { state, actor } = useStore();
  const [query, setQuery] = useState("");
  const [actorId, setActor] = useState("all");
  const [from, setFrom] = useState("");
  if (!managerOnly(actor?.role)) return <Denied />;
  const actors = [...new Set(state.events.map((item) => item.actorId))];
  const rows = state.events.filter(
    (item) =>
      (actorId === "all" || item.actorId === actorId) &&
      (!from || item.at.slice(0, 10) >= from) &&
      `${item.action} ${item.entityId} ${item.actorId}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <main className="container section">
      <PageTitle
        eyebrow="AUDIT HISTORY"
        title="A traceable record of demo changes."
        description="Events are append-only in normal application workflows and contain fictional identifiers. Browser owners can still alter localStorage; production requires server-side immutable logs."
      />
      <div className="filter-bar report-filters">
        <Field label="Search audit history" value={query} onChange={setQuery} />
        <Field label="Audit actor" value={actorId} onChange={setActor}>
          <option value="all">All actors</option>
          {actors.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Field>
        <Field
          label="Audit from date"
          value={from}
          onChange={setFrom}
          type="date"
        />
      </div>
      <section className="panel">
        {rows.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bangkok time</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {new Date(item.at).toLocaleString("en-GB", {
                        timeZone: "Asia/Bangkok",
                      })}
                    </td>
                    <td>{item.actorId}</td>
                    <td>
                      <strong>{item.action}</strong>
                    </td>
                    <td>{item.entityId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No matching audit events">
            Adjust the filters to see recorded changes.
          </Empty>
        )}
      </section>
    </main>
  );
}
