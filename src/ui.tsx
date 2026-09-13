import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Waves,
  ArrowUpRight,
  ArrowRight,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "./data/store";
import { roles } from "./domain/model";
export function Logo() {
  return (
    <Link className="logo" to="/" aria-label="DiveOS home">
      <Waves size={30} />
      <span>
        Dive<span className="logo-light">OS</span>
        <small>THE DIVE CENTER OPERATING SYSTEM</small>
      </span>
    </Link>
  );
}
export function Header() {
  const { actor, logout } = useStore();
  const nav = useNavigate();
  return (
    <>
      <div className="demo-strip">
        <span className="live-dot" /> FICTIONAL DEMO{" "}
        <span className="strip-extra">
          · Natneef Diving, Koh Tao · Payments & messages simulated
        </span>
      </div>
      <header>
        <div className="container header-inner">
          <Logo />
          <nav aria-label="Main navigation">
            <NavLink to="/courses">View Courses</NavLink>
            {actor ? (
              <>
                <NavLink to={actor.role === "customer" ? "/portal" : "/app"}>
                  My workspace
                </NavLink>
                <button
                  className="icon-button"
                  aria-label="Sign out"
                  onClick={() => {
                    logout();
                    nav("/");
                  }}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <NavLink to="/login">Sign In</NavLink>
            )}
            <Link className="button small" to="/demo">
              Try DiveOS <ArrowUpRight size={16} />
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="container footer-inner">
        <Logo />
        <p>Built around better days in the water.</p>
        <Link to="/demo">
          Explore the demo <ArrowRight size={16} />
        </Link>
      </div>
      <div className="container footer-bottom">
        Independent product prototype · No official SSI integration · ©{" "}
        {new Date().getFullYear()} DiveOS
      </div>
    </footer>
  );
}
export function Notice() {
  return (
    <div className="notice">
      <ShieldCheck size={20} />
      <p>
        <strong>A safe space to explore.</strong> Fictional data only, saved in
        this browser. Payments are simulated, messages are not sent, medical and
        waiver forms are placeholders, and SSI connectivity is not active. Do
        not enter real personal information.
      </p>
    </div>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  const s = String(children);
  return (
    <span
      className={`badge ${/paid|Confirmed|Checked|Approved/.test(s) ? "good" : /verification|Awaiting|Not started|Unassigned/.test(s) ? "warn" : ""}`}
    >
      {children}
    </span>
  );
}
export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <Waves size={32} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function WorkspaceNav() {
  const { actor } = useStore();
  return (
    <div className="workspace-nav">
      <div className="container">
        <span>
          Natneef Diving{" "}
          <small>
            {roles.find((r) => r.id === actor?.role)?.name} workspace
          </small>
        </span>
        <nav aria-label="Workspace navigation">
          {actor?.role === "customer" ? (
            <>
              <NavLink to="/portal" end>
                My bookings
              </NavLink>
              <NavLink to="/portal/profile">My profile</NavLink>
              <NavLink to="/portal/training">My training</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/app" end>
                {actor?.role === "manager"
                  ? "Dashboard"
                  : actor?.role === "instructor"
                    ? "Assigned students"
                    : "Bookings"}
              </NavLink>
              <NavLink to="/app/calendar">Operations calendar</NavLink>
              <NavLink to="/app/staffing">Staffing</NavLink>
              <NavLink to="/app/equipment">Equipment</NavLink>
              {(actor?.role === "instructor" || actor?.role === "manager") && (
                <NavLink to="/app/training">Training</NavLink>
              )}
              {(actor?.role === "frontdesk" || actor?.role === "manager") && (
                <>
                  <NavLink to="/app/customers">Customers</NavLink>
                  <NavLink to="/app/enquiries">Enquiries</NavLink>
                  <NavLink to="/app/new-booking">New booking</NavLink>
                </>
              )}
              {actor?.role === "manager" && (
                <>
                  <NavLink to="/app/products">Products</NavLink>
                  <NavLink to="/app/resources">Sites & boats</NavLink>
                  <NavLink to="/app/mvp-reports">Reports</NavLink>
                  <NavLink to="/app/notifications">Notifications</NavLink>
                  <NavLink to="/app/system">System</NavLink>
                  <NavLink to="/app/audit">Audit</NavLink>
                  <NavLink to="/app/settings">Operational settings</NavLink>
                </>
              )}
            </>
          )}
          <Link to="/demo">Switch demo role</Link>
        </nav>
      </div>
    </div>
  );
}
