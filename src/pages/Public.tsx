import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Users,
  Compass,
  CreditCard,
  ClipboardCheck,
  Anchor,
  Check,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { useStore } from "../data/store";
import { money, roles } from "../domain/model";
import { Notice, PageTitle } from "../ui";
export function Home() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow light">
              <span className="live-dot" /> LESS ADMIN. MORE OCEAN.
            </div>
            <h1>
              Great dives start
              <br />
              with a <em>clear day.</em>
            </h1>
            <p>
              One shared place for your bookings, divers and daily operations.
              DiveOS gives your team more time for what brought you to the
              water.
            </p>
            <div className="actions">
              <Link to="/demo" className="button mint">
                Try DiveOS <ArrowUpRight size={18} />
              </Link>
              <Link to="/courses" className="text-link">
                View Courses <ArrowRight size={18} />
              </Link>
            </div>
            <div className="hero-proof">
              <span>
                <Check size={16} /> Small teams, connected
              </span>
              <span>
                <Check size={16} /> Built for real dive days
              </span>
            </div>
          </div>
          <div
            className="ocean-scene"
            aria-label="Illustration of a connected dive-day plan"
          >
            <div className="contour c1" />
            <div className="contour c2" />
            <div className="contour c3" />
            <div className="contour c4" />
            <div className="ocean-coordinate">
              10°05′ N &nbsp; 99°50′ E<br />
              KOH TAO · THAILAND
            </div>
            <div className="route-line" />
            <div className="map-pin p1">
              <Anchor size={21} />
            </div>
            <div className="map-pin p2">
              <Waves size={24} />
            </div>
            <div className="day-card">
              <div className="day-card-top">
                <span className="eyebrow">YOUR NEXT DIVE DAY</span>
                <span className="live-dot" />
              </div>
              <h3>Everything in its place.</h3>
              <div className="day-row">
                <span className="mini-icon">
                  <Users size={18} />
                </span>
                <div>
                  <strong>A small group. A big adventure.</strong>
                  <small>Maximum 4 students per class</small>
                </div>
                <Check size={18} />
              </div>
              <div className="day-row">
                <span className="mini-icon">
                  <CreditCard size={18} />
                </span>
                <div>
                  <strong>Deposits, without the guesswork.</strong>
                  <small>10% to reserve a place</small>
                </div>
                <Check size={18} />
              </div>
              <div className="day-row">
                <span className="mini-icon">
                  <CalendarDays size={18} />
                </span>
                <div>
                  <strong>One plan for the whole team.</strong>
                  <small>Bookings connected to the calendar</small>
                </div>
                <Check size={18} />
              </div>
              <div className="card-foot">
                NATNEEF DIVING <span>EXPLORE THE DEMO ↗</span>
              </div>
            </div>
            <div className="depth-mark">
              ↧ &nbsp; A LITTLE LESS CHAOS. A LOT MORE CLARITY.
            </div>
          </div>
        </div>
      </section>
      <div className="principles">
        <div className="container">
          <span>MADE FOR DIVE CENTERS</span>
          <span>Customer journeys</span>
          <span>Team operations</span>
          <span>Training, connected</span>
          <span>One shared view</span>
        </div>
      </div>
      <section className="container section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">FROM FIRST HELLO TO FIRST DIVE</div>
            <h2>
              A better flow.
              <br />
              For everyone on board.
            </h2>
          </div>
          <p>
            Replace scattered spreadsheets and message threads with a journey
            your customers and team can follow together.
          </p>
        </div>
        <div className="feature-grid">
          {[
            {
              icon: Compass,
              title: "A confident start",
              text: "Discover a course, reserve a place and see exactly what to prepare.",
              tag: "FOR YOUR DIVERS",
            },
            {
              icon: CalendarDays,
              title: "A day that makes sense",
              text: "Bring bookings, students and available places into one operational view.",
              tag: "FOR YOUR TEAM",
            },
            {
              icon: BookOpen,
              title: "Room to grow",
              text: "Training, equipment and reporting are the next steps in the DiveOS roadmap.",
              tag: "WHAT COMES NEXT",
            },
          ].map(({ icon: Icon, title, text, tag }) => (
            <article className="feature" key={title}>
              <Icon size={26} />
              <small>{tag}</small>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="workflow-section">
        <div className="container section">
          <div className="eyebrow">ONE JOURNEY. CONNECTED END TO END.</div>
          <h2>
            From “I’d love to dive”
            <br />
            to “see you on the boat.”
          </h2>
          <div className="workflow">
            {[
              "Find a course",
              "Reserve a place",
              "Pay a demo deposit",
              "Prepare to dive",
            ].map((s, i) => (
              <div key={s}>
                <span>0{i + 1}</span>
                <h3>{s}</h3>
                <p>
                  {
                    [
                      "Browse Open Water, Advanced and Nitrox.",
                      "Choose a date and add your group.",
                      "Try a QR simulation or manual Wise flow.",
                      "See your booking in the portal and team calendar.",
                    ][i]
                  }
                </p>
              </div>
            ))}
          </div>
          <Link to="/courses/open-water" className="text-link dark">
            Explore the Open Water journey <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">AN HONEST LOOK AT THE MVP</div>
            <h2>
              Working today.
              <br />
              Built for tomorrow.
            </h2>
          </div>
          <Link to="/demo" className="button">
            Step inside <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="status-grid">
          <div>
            <ClipboardCheck />
            <h3>Try the connected booking flow</h3>
            <p>
              Course discovery, participants, document acknowledgements, demo
              deposits, customer portal, staff bookings and a shared calendar.
            </p>
            <span className="badge good">Working with demo data</span>
          </div>
          <div>
            <CreditCard />
            <h3>Explore without moving money</h3>
            <p>
              QR payments and Wise transfers are simulations. Messages are not
              sent, and there is no active SSI connection.
            </p>
            <span className="badge">Simulated integrations</span>
          </div>
          <div>
            <BarChart3 />
            <h3>Follow the next chapters</h3>
            <p>
              Full CRM, training milestones, equipment allocation, maintenance,
              advanced reports and real integrations are planned.
            </p>
            <span className="badge">Next phases</span>
          </div>
        </div>
      </section>
    </main>
  );
}
export function Demo() {
  const { login } = useStore();
  const navigate = useNavigate();
  return (
    <main className="container section">
      <PageTitle
        eyebrow="WELCOME TO NATNEEF DIVING"
        title="See the day from every side."
        description="Choose a role to explore. Switch roles in the same browser to follow one booking through the whole team."
      />
      <Notice />
      <div className="role-grid">
        {roles.map((r, i) => (
          <article className="role-card" key={r.id}>
            <span className="role-number">0{i + 1}</span>
            <h2>{r.name}</h2>
            <p>{r.description}</p>
            <div className="demo-person">
              <span className="avatar">{r.person[0]}</span>
              <span>
                {r.person}
                <small>Fictional demo profile</small>
              </span>
            </div>
            <button
              onClick={() => {
                login(r.id);
                navigate(r.id === "customer" ? "/portal" : "/app");
              }}
            >
              Continue as {r.name} <ArrowRight size={17} />
            </button>
          </article>
        ))}
      </div>
      <p className="muted">
        No password needed. This is one-click demo access, not production
        authentication. Changes persist in this browser; other devices have
        separate demo data.
      </p>
    </main>
  );
}
export function Catalogue() {
  const { state } = useStore();
  return (
    <main className="container section">
      <PageTitle
        eyebrow="NATNEEF DIVING · KOH TAO"
        title="Your next chapter starts underwater."
        description="Small groups, thoughtful instruction and a little more ocean in your life. Explore our fictional demo courses."
      />
      <div className="course-grid">
        {state.courses
          .filter((c) => c.published)
          .map((c, i) => (
            <article className="course-card" key={c.id}>
              <div className={`course-art art-${i}`}>
                <span>0{i + 1} / NATNEEF DIVING</span>
                <WavesIcon index={i} />
                <small>
                  {c.durationDays} {c.durationDays === 1 ? "DAY" : "DAYS"} · MAX
                  4 STUDENTS
                </small>
              </div>
              <div className="course-body">
                <div className="eyebrow">{c.category}</div>
                <h2>{c.name}</h2>
                <p>{c.description}</p>
                <div className="course-price">
                  <span>
                    <strong>{money(c.price)}</strong> / person
                    <small>
                      {money(Math.round((c.price * c.depositBps) / 10000))} demo
                      deposit
                    </small>
                  </span>
                  <Link
                    className="round-link"
                    aria-label={`View ${c.name}`}
                    to={`/courses/${c.id}`}
                  >
                    <ArrowUpRight />
                  </Link>
                </div>
              </div>
            </article>
          ))}
      </div>
      <p className="muted">
        Demo assumptions: durations, prerequisites and included items require
        dive-center review. These are not official agency training materials.
      </p>
    </main>
  );
}
function WavesIcon({ index }: { index: number }) {
  return (
    <div className="course-symbol">
      {index === 0 ? (
        <Compass size={86} strokeWidth={1} />
      ) : index === 1 ? (
        <Anchor size={86} strokeWidth={1} />
      ) : (
        <Waves size={86} strokeWidth={1} />
      )}
    </div>
  );
}
import { Waves } from "lucide-react";
