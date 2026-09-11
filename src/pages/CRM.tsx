import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../data/store";
import { type Customer, dateLabel } from "../domain/model";
import { staff } from "../domain/commands";
import {
  saveCustomer,
  createEnquiry,
  changeEnquiry,
} from "../domain/operations";
import { PageTitle, Notice, Badge, Empty } from "../ui";
import { Field, useAction, Denied } from "./operation-ui";
function CustomerEditor({
  customer,
  onSaved,
}: {
  customer?: Customer;
  onSaved?: (c: Customer) => void;
}) {
  const { state } = useStore();
  const { run, feedback } = useAction();
  const [form, setForm] = useState<
    Partial<Customer> & { name: string; email: string }
  >({
    ...customer,
    name: customer?.name || "",
    email: customer?.email || "",
    certification: customer?.certification || "New diver",
    loggedDives: customer?.loggedDives || 0,
  });
  const field = (key: keyof Customer, label: string, type = "text") => (
    <Field
      key={key}
      label={label}
      value={String(form[key] ?? "")}
      type={type}
      onChange={(v) =>
        setForm((f) => ({ ...f, [key]: key === "loggedDives" ? Number(v) : v }))
      }
      required={key === "name" || key === "email"}
    />
  );
  return (
    <>
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          const next = run(
            (s, a) => saveCustomer(s, a, form),
            "Customer profile saved.",
          );
          if (next)
            onSaved?.(
              form.id
                ? next.customers.find((c) => c.id === form.id)!
                : next.customers.at(-1)!,
            );
        }}
      >
        <h2>{customer ? "Diver profile" : "Create a fictional customer"}</h2>
        <div className="form-grid">
          {field("name", "Full name")}
          {field("preferredName", "Preferred name")}
          {field("email", "Email", "email")}
          {field("phone", "Phone")}
          {field("dateOfBirth", "Date of birth", "date")}
          {field("nationality", "Nationality")}
          {field("language", "Preferred language")}
          {field("emergencyName", "Emergency contact name")}
          {field("emergencyPhone", "Emergency contact phone")}
          {field("certificationOrg", "Certification organization")}
          {field("certification", "Certification level")}
          {field("certificationNumber", "Certification number")}
          {field("loggedDives", "Logged dives", "number")}
          {field("lastDive", "Last dive", "date")}
        </div>
        <div className="form-spacer">
          {field(
            "notes",
            "Operational notes — no sensitive medical information",
            "textarea",
          )}
        </div>
        {feedback}
        <button>Save customer profile</button>
      </form>
      {customer && (
        <section className="panel">
          <h2>Booking history</h2>
          {state.bookings
            .filter((b) => b.customerId === customer.id)
            .map((b) => {
              const a = state.activities.find((a) => a.id === b.activityId)!;
              return (
                <div className="payment-row" key={b.id}>
                  <div>
                    <strong>
                      {state.courses.find((c) => c.id === a.courseId)?.name}
                    </strong>
                    <small>
                      {dateLabel(a.date)} · {b.participants.length} participants
                    </small>
                  </div>
                  <Badge>{b.status}</Badge>
                </div>
              );
            })}
          {!state.bookings.some((b) => b.customerId === customer.id) && (
            <p className="muted">No bookings yet.</p>
          )}
          <p className="muted">
            Created {customer.createdAt.slice(0, 10)} · updated{" "}
            {customer.updatedAt.slice(0, 10)}
          </p>
        </section>
      )}
    </>
  );
}
export function CustomerProfile() {
  const { actor, state } = useStore();
  const customer = state.customers.find((c) => c.id === actor?.customerId);
  if (!customer) return <Denied />;
  return (
    <main className="container section">
      <PageTitle
        eyebrow="CUSTOMER PORTAL"
        title="A profile ready for your next dive."
        description="Use fictional details only. Medical information is limited to operational statuses."
      />
      <Notice />
      <CustomerEditor key={customer.id} customer={customer} />
    </main>
  );
}
export function CRM() {
  const { actor, state } = useStore();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [showNew, setShowNew] = useState(false);
  if (!staff(actor)) return <Denied />;
  const customer = state.customers.find((c) => c.id === selected);
  return (
    <main className="container section">
      <PageTitle
        eyebrow="CUSTOMER RELATIONSHIPS"
        title="Know your divers."
        description="One customer record connects enquiries, bookings and diver preparation."
        action={
          <button
            onClick={() => {
              setSelected("");
              setShowNew(true);
            }}
          >
            New customer
          </button>
        }
      />
      <Notice />
      <div className="ops-columns">
        <section className="panel">
          <h2>Customer directory</h2>
          <Field label="Search customers" value={query} onChange={setQuery} />
          <div className="directory">
            {state.customers
              .filter((c) =>
                `${c.name} ${c.email}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((c) => (
                <button
                  key={c.id}
                  className={`directory-row ${c.id === selected ? "selected" : ""}`}
                  onClick={() => {
                    setSelected(c.id);
                    setShowNew(false);
                  }}
                >
                  <span className="avatar">{c.name[0]}</span>
                  <span>
                    {c.name}
                    <small>{c.email}</small>
                  </span>
                </button>
              ))}
          </div>
          <Link className="text-link" to="/app/enquiries">
            Manage enquiries →
          </Link>
        </section>
        <div>
          {showNew || customer ? (
            <>
              <CustomerEditor
                key={customer?.id || "new"}
                customer={customer}
                onSaved={(c) => {
                  setSelected(c.id);
                  setShowNew(false);
                }}
              />
              {customer && (
                <Link
                  className="button"
                  to={`/app/bookings/new?customer=${customer.id}`}
                >
                  Create booking for {customer.name}
                </Link>
              )}
            </>
          ) : (
            <Empty title="Select a diver.">
              Open a customer record, or create a new fictional profile.
            </Empty>
          )}
        </div>
      </div>
    </main>
  );
}
export function Enquiries() {
  const { state, actor } = useStore();
  const { run, feedback } = useAction();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [courseId, setCourse] = useState(state.courses[0]?.id || "");
  const [message, setMessage] = useState("");
  if (!staff(actor)) return <Denied />;
  return (
    <main className="container section">
      <PageTitle
        eyebrow="FRONT DESK"
        title="From first hello to a new diver."
        description="Record enquiries, follow up internally and convert them into connected customer records. No message is actually sent."
      />
      <div className="ops-columns">
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              run(
                (s, a) =>
                  createEnquiry(s, a, { name, email, courseId, message }),
                "Enquiry created.",
              )
            ) {
              setName("");
              setEmail("");
              setMessage("");
            }
          }}
        >
          <h2>New enquiry</h2>
          <div className="stack-fields">
            <Field
              label="Enquirer name"
              value={name}
              onChange={setName}
              required
            />
            <Field
              label="Enquirer email"
              type="email"
              value={email}
              onChange={setEmail}
              required
            />
            <Field
              label="Interested course"
              value={courseId}
              onChange={setCourse}
            >
              {state.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Field>
            <Field
              label="Enquiry message"
              type="textarea"
              value={message}
              onChange={setMessage}
              required
            />
          </div>
          <button>Create enquiry</button>
        </form>
        <section>
          {feedback}
          {state.enquiries.length === 0 ? (
            <Empty title="No enquiries yet.">
              Create a fictional enquiry to begin the front-desk journey.
            </Empty>
          ) : (
            state.enquiries.map((q) => (
              <article className="panel" key={q.id}>
                <div className="panel-heading">
                  <h2>{q.name}</h2>
                  <Badge>{q.status}</Badge>
                </div>
                <p>{q.message}</p>
                <p className="muted">
                  {q.email} ·{" "}
                  {state.courses.find((c) => c.id === q.courseId)?.name}
                </p>
                {q.status !== "Converted" && q.status !== "Closed" ? (
                  <div className="actions compact">
                    <button
                      className="small"
                      onClick={() =>
                        run(
                          (s, a) => changeEnquiry(s, a, q.id, "Converted"),
                          "Enquiry converted to a customer record.",
                        )
                      }
                    >
                      Convert to customer
                    </button>
                    {q.status === "New" && (
                      <button
                        className="small secondary"
                        onClick={() =>
                          run(
                            (s, a) => changeEnquiry(s, a, q.id, "Contacted"),
                            "Follow-up status recorded. No message sent.",
                          )
                        }
                      >
                        Mark contacted
                      </button>
                    )}
                    <button
                      className="small secondary"
                      onClick={() => {
                        if (confirm("Close this fictional enquiry?"))
                          run((s, a) => changeEnquiry(s, a, q.id, "Closed"));
                      }}
                    >
                      Close enquiry
                    </button>
                  </div>
                ) : (
                  q.customerId && (
                    <Link
                      className="button secondary"
                      to={`/app/bookings/new?customer=${q.customerId}`}
                    >
                      Create booking
                    </Link>
                  )
                )}
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
export function ManualBooking() {
  const { state, actor } = useStore();
  if (!staff(actor)) return <Denied />;
  return (
    <main className="container section">
      <PageTitle
        eyebrow="FRONT DESK"
        title="Create a booking for your customer."
        description="Choose a product, then select the customer and complete the shared booking workflow."
      />
      <div className="booking-cards">
        {state.courses
          .filter((c) => c.published)
          .map((c) => (
            <section className="panel" key={c.id}>
              <h2>{c.name}</h2>
              <Link className="button" to={`/courses/${c.id}`}>
                Book {c.name}
              </Link>
            </section>
          ))}
      </div>
    </main>
  );
}
