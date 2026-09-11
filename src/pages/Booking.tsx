import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Users,
  ShieldCheck,
  CreditCard,
  QrCode,
} from "lucide-react";
import { useStore } from "../data/store";
import {
  balance,
  staff,
  createBooking,
  paid,
  reserved,
  submitDocuments,
  submitPayment,
} from "../domain/commands";
import {
  dateLabel,
  money,
  STANDARD_EQUIPMENT,
  type DiverExperience,
} from "../domain/model";
import { Badge, Empty, Notice, PageTitle } from "../ui";
import {
  priceBooking,
  effectiveRules,
  courseEquipment,
  type ParticipantInput,
} from "../domain/policies";
export const legal =
  "Demo content — requires review by a qualified Thai legal and diving-safety professional before production use.";
export function CourseDetail() {
  const { courseId } = useParams();
  const { state, actor, login, update } = useStore();
  const navigate = useNavigate();
  const course = state.courses.find((c) => c.id === courseId && c.published);
  const activities = state.activities.filter((a) => a.courseId === courseId);
  const [activityId, setActivityId] = useState(activities[0]?.id || "");
  const [participants, setParticipants] = useState<ParticipantInput[]>([
    { name: "Alex Morgan" },
  ]);
  const [customerId, setCustomerId] = useState(state.customers[0]?.id || "");
  const [documents, setDocuments] = useState(false);
  const [terms, setTerms] = useState(false);
  const [prerequisites, setPrerequisites] = useState(false);
  const [method, setMethod] = useState<"QR" | "Wise">("QR");
  const [error, setError] = useState("");
  if (!course)
    return (
      <main className="container section">
        <h1>Course not found</h1>
        <Link className="button" to="/courses">
          View Courses
        </Link>
      </main>
    );
  const activity = activities.find((a) => a.id === activityId);
  const fun = course.kind === "fun-dive";
  let pricing = {
    total: course.price * participants.length,
    deposit: Math.round(
      (course.price * participants.length * course.depositBps) / 10000,
    ),
    lines: [] as ReturnType<typeof priceBooking>["lines"],
  };
  if (activity) {
    try {
      pricing = priceBooking(
        state,
        activity,
        participants.map((p) => ({ ...p, name: p.name || "Demo participant" })),
        false,
      );
    } catch {
      /* Submission reports validation. */
    }
  }
  const capacity = (a: (typeof activities)[number]) =>
    Math.min(
      effectiveRules(state, a).capacity,
      ...state.sessions
        .filter((x) => x.activityId === a.id)
        .map((x) => effectiveRules(state, a, x).capacity),
    );
  const available = activity
    ? capacity(activity) - reserved(state, activity.id)
    : 0;
  const change = (i: number, patch: Partial<ParticipantInput>) =>
    setParticipants((ps) =>
      ps.map((p, n) => (n === i ? { ...p, ...patch } : p)),
    );
  const experience = (p: ParticipantInput): DiverExperience =>
    p.certification || {
      agency: "",
      level: "",
      number: "",
      loggedDives: 0,
      lastDive: "",
    };
  function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const id = update((s, a) => {
        const next = createBooking(s, a, {
          activityId,
          customerId: staff(a) ? customerId : undefined,
          participants,
          documents,
          terms,
          prerequisites,
          method,
        });
        return { state: next.state, result: next.id };
      });
      navigate(staff(actor) ? "/app" : `/portal/bookings/${id}`);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <main className="container section">
      <Link className="back-link" to="/courses">
        <ArrowLeft size={15} /> All courses
      </Link>
      <PageTitle
        eyebrow={`NATNEEF DIVING · ${course.durationDays}-DAY DEMO ${fun ? "FUN DIVE" : "COURSE"}`}
        title={course.name}
        description={course.description}
      />
      <div className="booking-layout">
        <div>
          <div className="course-facts">
            <span>
              <CalendarDays size={18} />
              {course.durationDays} days
            </span>
            <span>
              <Users size={18} />
              Maximum {course.capacity} participants
            </span>
            <span>
              <ShieldCheck size={18} />
              {fun ? "Guided recreational diving" : "Small-group instruction"}
            </span>
          </div>
          <section className="panel">
            <h2>Your activity, at a glance</h2>
            <div className="included-grid">
              {[
                ...course.included,
                ...(!fun && activity ? courseEquipment(state, activity) : []),
              ].map((x) => (
                <span key={x}>
                  <Check size={16} />
                  {x}
                </span>
              ))}
            </div>
            <div className="assumption">
              <strong>Before you book</strong>
              <p>{course.prerequisites}</p>
              <p>
                Course duration, itinerary, prerequisites and inclusions are
                configurable demo assumptions, subject to operator review.
              </p>
            </div>
          </section>
          {actor?.role !== "customer" && !staff(actor) ? (
            <section className="panel">
              <h2>Book as a demo customer</h2>
              <p>
                Use Alex’s fictional profile to follow the complete booking
                journey. Your course selection stays here.
              </p>
              <button onClick={() => login("customer")}>
                Continue as Customer <ArrowRight size={17} />
              </button>
            </section>
          ) : (
            <form onSubmit={submit} className="booking-form">
              {staff(actor) && (
                <section className="panel">
                  <label>
                    Booking customer
                    <select
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      required
                    >
                      {state.customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </section>
              )}
              <section className="panel">
                <h2>
                  <span className="step">01</span> Choose your date
                </h2>
                <div className="form-grid">
                  <label>
                    Available start date
                    <select
                      value={activityId}
                      onChange={(e) => setActivityId(e.target.value)}
                      required
                    >
                      {activities.map((a) => (
                        <option key={a.id} value={a.id}>
                          {dateLabel(a.date)} ·{" "}
                          {Math.max(0, capacity(a) - reserved(state, a.id))}{" "}
                          places left
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Participants
                    <select
                      aria-label="Participants"
                      value={participants.length}
                      onChange={(e) => {
                        const count = Number(e.target.value);
                        setParticipants((old) =>
                          Array.from(
                            { length: count },
                            (_, i) => old[i] || { name: "" },
                          ),
                        );
                      }}
                    >
                      {Array.from(
                        { length: activity ? capacity(activity) : 1 },
                        (_, i) => i + 1,
                      ).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "participant" : "participants"}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <p className="muted">
                  {activity &&
                    `${dateLabel(activity.date)} – ${dateLabel(activity.endDate)} · ${activity.time} · Asia/Bangkok`}
                  . {available} places available. Places are reserved when you
                  create a booking.
                </p>
              </section>
              <section className="panel">
                <h2>
                  <span className="step">02</span> Meet your group
                </h2>
                <p className="muted">
                  Use fictional names. Your Instructor or Divemaster will fit
                  and assign equipment before diving. Customers select packages
                  or categories only.
                </p>
                {participants.map((p, i) => (
                  <fieldset key={i}>
                    <legend>Participant {i + 1}</legend>
                    <div className="form-grid">
                      <label>
                        Full name
                        <input
                          required
                          minLength={2}
                          maxLength={80}
                          autoComplete="off"
                          value={p.name}
                          onChange={(e) =>
                            setParticipants((ps) =>
                              ps.map((p, n) =>
                                n === i ? { ...p, name: e.target.value } : p,
                              ),
                            )
                          }
                        />
                      </label>
                    </div>
                    {!fun ? (
                      <p>
                        Included at no extra charge:{" "}
                        {activity &&
                          courseEquipment(state, activity).join(", ")}
                        . No equipment upsell.
                      </p>
                    ) : (
                      <>
                        <div className="form-grid">
                          <label>
                            Certification agency
                            <select
                              required
                              value={experience(p).agency}
                              onChange={(e) =>
                                change(i, {
                                  certification: {
                                    ...experience(p),
                                    agency: e.target.value,
                                  },
                                })
                              }
                            >
                              <option value="">Select agency</option>
                              {[
                                "SSI",
                                "PADI",
                                "NAUI",
                                "CMAS",
                                "SDI",
                                "BSAC",
                                "Other recognized agency",
                              ].map((x) => (
                                <option key={x}>{x}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Certification level
                            <input
                              required
                              value={experience(p).level}
                              onChange={(e) =>
                                change(i, {
                                  certification: {
                                    ...experience(p),
                                    level: e.target.value,
                                  },
                                })
                              }
                            />
                          </label>
                          <label>
                            Certification number
                            <input
                              required
                              value={experience(p).number}
                              onChange={(e) =>
                                change(i, {
                                  certification: {
                                    ...experience(p),
                                    number: e.target.value,
                                  },
                                })
                              }
                            />
                          </label>
                          <label>
                            Logged dives
                            <input
                              required
                              type="number"
                              min="0"
                              step="1"
                              value={experience(p).loggedDives}
                              onChange={(e) =>
                                change(i, {
                                  certification: {
                                    ...experience(p),
                                    loggedDives: Number(e.target.value),
                                  },
                                })
                              }
                            />
                          </label>
                          <label>
                            Last dive date
                            <input
                              required
                              type="date"
                              value={experience(p).lastDive}
                              onChange={(e) =>
                                change(i, {
                                  certification: {
                                    ...experience(p),
                                    lastDive: e.target.value,
                                  },
                                })
                              }
                            />
                          </label>
                          <label>
                            Equipment rental
                            <select
                              value={p.rental?.mode || "none"}
                              onChange={(e) =>
                                change(i, {
                                  rental: {
                                    mode: e.target.value as
                                      "none" | "full" | "individual",
                                    categories: [],
                                  },
                                })
                              }
                            >
                              <option value="none">
                                Own equipment · no rental
                              </option>
                              <option value="full">
                                Full Equipment Package
                              </option>
                              <option value="individual">
                                Individual items
                              </option>
                            </select>
                          </label>
                        </div>
                        <p className="muted">
                          Full package:{" "}
                          {state.settings.equipmentPackage.join(", ")} ·{" "}
                          {money(state.settings.fullPackageDailyPrice)}/day.
                          Fictional demo prices.
                        </p>
                        {p.rental?.mode === "individual" &&
                          STANDARD_EQUIPMENT.map((category) => (
                            <label className="check-row" key={category}>
                              <input
                                type="checkbox"
                                checked={p.rental!.categories.includes(
                                  category,
                                )}
                                onChange={(e) =>
                                  change(i, {
                                    rental: {
                                      mode: "individual",
                                      categories: e.target.checked
                                        ? [...p.rental!.categories, category]
                                        : p.rental!.categories.filter(
                                            (x) => x !== category,
                                          ),
                                    },
                                  })
                                }
                              />
                              {category} ·{" "}
                              {money(
                                category === "Dive computer"
                                  ? state.settings.computerDailyPrice
                                  : state.settings.individualDailyPrices[
                                      category
                                    ],
                              )}
                              /day
                            </label>
                          ))}
                        <p className="document-note">
                          More than {state.settings.refresherMonths} calendar
                          months since your last dive on the activity date? A
                          mandatory Refresher (
                          {money(state.settings.refresherPrice)}, fictional fee)
                          is added automatically. Book now; complete it before
                          Fun Dive check-in. This recreational activity creates
                          no training enrolment or certification.
                        </p>
                      </>
                    )}
                  </fieldset>
                ))}
              </section>
              <section className="panel">
                <h2>
                  <span className="step">03</span> Get ready to dive
                </h2>
                <label className="check-row">
                  <input
                    type="checkbox"
                    required
                    checked={prerequisites}
                    onChange={(e) => setPrerequisites(e.target.checked)}
                  />
                  <span>
                    I have reviewed the demo prerequisites for every
                    participant.
                  </span>
                </label>
                <div className="document-note">
                  <strong>Demo document preparation</strong>
                  <p>
                    Medical declaration, liability waiver, and terms are
                    required before check-in. Certification evidence, ID, or
                    guardian consent may also be needed after staff review. This
                    acknowledgement records submission only; it does not
                    establish medical clearance.
                  </p>
                  <p>{legal}</p>
                </div>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={documents}
                    onChange={(e) => setDocuments(e.target.checked)}
                  />
                  <span>
                    Submit placeholder medical and waiver acknowledgements for
                    all participants.
                    <small>
                      Optional now. You can submit these in the portal later. No
                      medical answers or files are collected.
                    </small>
                  </span>
                </label>
                <label className="check-row">
                  <input
                    type="checkbox"
                    required
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                  />
                  <span>
                    I accept the demo terms: fictional booking, simulated
                    payment, no actual course reservation.<small>{legal}</small>
                  </span>
                </label>
              </section>
              <section className="panel">
                <h2>
                  <span className="step">04</span> Choose a demo payment
                </h2>
                <div className="payment-options">
                  {(["QR", "Wise"] as const).map((m) => (
                    <label className={method === m ? "selected" : ""} key={m}>
                      <input
                        type="radio"
                        name="payment"
                        checked={method === m}
                        onChange={() => setMethod(m)}
                      />
                      {m === "QR" ? (
                        <QrCode size={23} />
                      ) : (
                        <CreditCard size={23} />
                      )}
                      <span>
                        {m === "QR"
                          ? "Demo QR payment"
                          : "Wise manual transfer"}
                        <small>
                          {m === "QR"
                            ? "Instant simulation · no money moves"
                            : "Mock proof · staff approval required"}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={available < participants.length}
                  className="full"
                >
                  Create booking & continue <ArrowRight size={17} />
                </button>
                {available < participants.length && (
                  <p className="error">
                    Not enough places for this group. Choose another date or
                    fewer participants.
                  </p>
                )}
                <p className="muted">
                  The next step shows your calculated deposit. No real payment
                  is collected.
                </p>
              </section>
            </form>
          )}
        </div>
        <aside className="booking-summary">
          <div className="panel">
            <div className="eyebrow">YOUR NEXT ADVENTURE</div>
            <h2>{course.name}</h2>
            <div className="summary-row">
              <span>
                {fun ? "Fun Dive" : "Course"} × {participants.length}
              </span>
              <strong>{money(course.price * participants.length)}</strong>
            </div>
            {pricing.lines
              .filter((l) => l.kind !== "product")
              .map((l, i) => (
                <div className="summary-row" key={i}>
                  <span>
                    {l.label} × {l.quantity}
                  </span>
                  <strong>{money(l.amount)}</strong>
                </div>
              ))}
            <div className="summary-row total">
              <span>Total</span>
              <strong>{money(pricing.total)}</strong>
            </div>
            <div className="deposit-box">
              <span>{course.depositBps / 100}% demo deposit</span>
              <strong>{money(pricing.deposit)}</strong>
              <small>
                {money(pricing.total - pricing.deposit)} remaining after deposit
              </small>
            </div>
            <p className="muted">
              THB · No additional tax or fee in this demo. Equipment and dates
              are demo assumptions.
            </p>
          </div>
          <Notice />
        </aside>
      </div>
    </main>
  );
}
export function BookingDetail() {
  const { bookingId } = useParams();
  const { state, actor, update } = useStore();
  const [error, setError] = useState("");
  const booking = state.bookings.find(
    (b) => b.id === bookingId && b.customerId === actor?.customerId,
  );
  if (!booking)
    return (
      <main className="container section">
        <h1>Booking not found</h1>
        <Link to="/portal">Return to your portal</Link>
      </main>
    );
  const activity = state.activities.find((a) => a.id === booking.activityId)!;
  const course = state.courses.find((c) => c.id === activity.courseId)!;
  const received = paid(state, booking.id);
  const paymentDue = booking.status === "Awaiting payment";
  function run(action: "payment" | "documents") {
    setError("");
    try {
      update((s, a) => ({
        state:
          action === "payment"
            ? submitPayment(s, a, booking!.id)
            : submitDocuments(s, a, booking!.id),
        result: undefined,
      }));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <main className="container section">
      <Link className="back-link" to="/portal">
        <ArrowLeft size={15} /> My bookings
      </Link>
      <PageTitle
        eyebrow={`BOOKING ${booking.id.slice(0, 8).toUpperCase()}`}
        title={
          received > 0
            ? "Your place is reserved."
            : booking.status === "Payment verification"
              ? "Your transfer is awaiting review."
              : "One step closer to the ocean."
        }
        description={
          received > 0
            ? "Demo deposit received. Your booking is now visible to the Natneef team."
            : booking.status === "Payment verification"
              ? "A fictional proof record has been saved. Switch to Front Desk to approve or reject it."
              : "Complete the demo deposit below to reserve your fictional place."
        }
      />
      <div className="booking-layout">
        <div>
          <section className="panel">
            <div className="panel-heading">
              <h2>{course.name}</h2>
              <Badge>{booking.status}</Badge>
            </div>
            <div className="course-facts">
              <span>
                <CalendarDays size={17} />
                {dateLabel(activity.date)}
              </span>
              <span>
                <Users size={17} />
                {booking.participants.length}{" "}
                {course.kind === "fun-dive" ? "divers" : "students"}
              </span>
            </div>
            <p className="muted">
              {activity.time} Asia/Bangkok · {activity.site}
            </p>
            {booking.lineItems?.map((l) => (
              <div className="summary-row" key={l.id}>
                <span>
                  {l.label} × {l.quantity}
                </span>
                <strong>{money(l.amount)}</strong>
              </div>
            ))}
            <div className="summary-row">
              <span>Total booking</span>
              <strong>{money(booking.total)}</strong>
            </div>
            <div className="summary-row">
              <span>Demo payments received</span>
              <strong>{money(received)}</strong>
            </div>
            <div className="summary-row total">
              <span>Outstanding balance</span>
              <strong>{money(balance(state, booking))}</strong>
            </div>
          </section>
          {paymentDue && (
            <section className="panel payment-panel">
              <div className="eyebrow">SIMULATED PAYMENT ONLY</div>
              <h2>
                {booking.method === "QR"
                  ? "Try the demo QR flow"
                  : "Submit a mock Wise transfer"}
              </h2>
              <p>
                Deposit due: <strong>{money(booking.deposit)}</strong>
              </p>
              {booking.method === "QR" ? (
                <>
                  <div
                    className="qr-placeholder"
                    aria-label="Non-scannable demo QR placeholder"
                  >
                    <QrCode size={100} strokeWidth={1.3} />
                    <span>DEMO · DO NOT SCAN</span>
                  </div>
                  <p>
                    This is a non-scannable placeholder. No bank account or
                    payment provider is connected.
                  </p>
                </>
              ) : (
                <div className="document-note">
                  <strong>Placeholder transfer instructions</strong>
                  <p>
                    Recipient: Natneef Diving Demo. Bank details: intentionally
                    unavailable. No actual Wise transfer should be made.
                    Submitting creates a fictional proof reference for staff
                    review.
                  </p>
                </div>
              )}
              <button onClick={() => run("payment")}>
                {booking.method === "QR"
                  ? "Simulate successful payment"
                  : "Mark demo transfer as submitted"}{" "}
                <ArrowRight size={17} />
              </button>
            </section>
          )}
          <section className="panel">
            <h2>Participants & preparation</h2>
            <p className="muted">
              Submitted acknowledgements still require operational review before
              real diving.
            </p>
            {booking.participants.map((p) => (
              <div className="participant-row" key={p.id}>
                <span className="avatar">{p.name[0]}</span>
                <div>
                  <strong>{p.name}</strong>
                  <small>
                    {p.equipment} · Medical: {p.medical}
                  </small>
                  {p.refresher && (
                    <small>
                      Mandatory Refresher: {p.refresher.status}
                      {p.refresher.scheduledFor
                        ? ` · ${p.refresher.scheduledFor}`
                        : " · contact the team to schedule"}
                    </small>
                  )}
                </div>
                <Badge>
                  {p.documents === "Submitted" ? "Acknowledged" : "Not started"}
                </Badge>
              </div>
            ))}
            {booking.participants.some((p) => p.documents !== "Submitted") && (
              <>
                <p className="muted">
                  By selecting below, you submit placeholder medical and waiver
                  acknowledgements for this fictional group. No health answers
                  are collected.
                </p>
                <p className="legal">{legal}</p>
                <button className="secondary" onClick={() => run("documents")}>
                  Submit demo document acknowledgements
                </button>
              </>
            )}
          </section>
          {state.payments.some((p) => p.bookingId === booking.id) && (
            <section className="panel">
              <h2>Payment history</h2>
              {state.payments
                .filter((p) => p.bookingId === booking.id)
                .map((p) => (
                  <div className="payment-row" key={p.id}>
                    <div>
                      <strong>
                        {p.method} · {money(p.amount)}
                      </strong>
                      <small>{p.reference} · fictional transaction</small>
                    </div>
                    <Badge>{p.status}</Badge>
                  </div>
                ))}
            </section>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>
        <aside className="booking-summary">
          <section className="panel">
            <div className="eyebrow">WHAT HAPPENS NEXT</div>
            <h2>A clear path ahead.</h2>
            <ol className="next-steps">
              <li>Reserve your place with a simulated deposit.</li>
              <li>Submit your demo document acknowledgements.</li>
              <li>Front Desk confirms your booking and checks the group in.</li>
            </ol>
            <p className="muted">
              Course training progress appears in My training. Fun Dives are
              recreational and have no training enrolment. This demo does not
              issue qualifications.
            </p>
            <Link className="button secondary full" to="/demo">
              View as another role
            </Link>
          </section>
          <Notice />
        </aside>
      </div>
    </main>
  );
}
export function Portal() {
  const { state, actor } = useStore();
  const bookings = state.bookings.filter(
    (b) => b.customerId === actor?.customerId,
  );
  return (
    <main className="container section">
      <PageTitle
        eyebrow="YOUR CUSTOMER PORTAL"
        title="Welcome back, Alex."
        description="A little preparation now. A great day in the water later."
        action={
          <Link className="button" to="/courses">
            Find your next course <ArrowRight size={17} />
          </Link>
        }
      />
      <Notice />
      <div className="stat-grid">
        <div>
          <span>Your bookings</span>
          <strong>{bookings.length}</strong>
        </div>
        <div>
          <span>Demo deposits paid</span>
          <strong>
            {money(bookings.reduce((n, b) => n + paid(state, b.id), 0))}
          </strong>
        </div>
        <div>
          <span>Outstanding balance</span>
          <strong>
            {money(bookings.reduce((n, b) => n + balance(state, b), 0))}
          </strong>
        </div>
      </div>
      <h2 className="subheading">Your dive plans</h2>
      {bookings.length === 0 ? (
        <Empty title="Your first adventure is waiting.">
          Choose a course and reserve a fictional place.{" "}
          <Link to="/courses">Explore courses →</Link>
        </Empty>
      ) : (
        <div className="booking-cards">
          {bookings.map((b) => {
            const a = state.activities.find((a) => a.id === b.activityId)!;
            const c = state.courses.find((c) => c.id === a.courseId)!;
            return (
              <article className="panel booking-card" key={b.id}>
                <div className="booking-date">
                  <strong>{dateLabel(a.date, { day: "2-digit" })}</strong>
                  <small>{dateLabel(a.date, { month: "short" })}</small>
                </div>
                <div className="booking-main">
                  <div className="eyebrow">
                    {b.id.slice(0, 8).toUpperCase()}
                  </div>
                  <h3>{c.name}</h3>
                  <p>
                    {dateLabel(a.date)} · {a.time} · {b.participants.length}{" "}
                    {c.kind === "fun-dive" ? "divers" : "students"}
                  </p>
                  <Badge>{b.status}</Badge>
                </div>
                <div className="booking-card-end">
                  <span>
                    {money(balance(state, b))}
                    <small>Outstanding balance</small>
                  </span>
                  <Link
                    className="button secondary"
                    to={`/portal/bookings/${b.id}`}
                  >
                    {b.status === "Awaiting payment"
                      ? "Continue to payment"
                      : "View booking"}{" "}
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
