import { CRM, Enquiries, CustomerProfile, ManualBooking } from "./pages/CRM";
import { Training, CustomerTraining } from "./pages/Training";
import { Equipment } from "./pages/Equipment";
import { Staffing } from "./pages/Staffing";
import { Configuration, Reports } from "./pages/Configuration";
import {
  AuditHistory,
  ManagerDashboard,
  MvpReports,
  NotificationCenter,
  ProductManagement,
  ResourceManagement,
  SystemSettings,
} from "./pages/Phase4";
import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import { Component, type ReactNode } from "react";
import { StoreProvider, useStore } from "./data/store";
import { Header, Footer, WorkspaceNav } from "./ui";
import { Home, Demo, Catalogue } from "./pages/Public";
import { CourseDetail, BookingDetail, Portal } from "./pages/Booking";
import { Staff, Calendar } from "./pages/Staff";
function WorkspaceHome() {
  const { actor } = useStore();
  return actor?.role === "manager" ? <ManagerDashboard /> : <Staff />;
}
function Protected({ customer = false }: { customer?: boolean }) {
  const { actor } = useStore();
  if (!actor)
    return (
      <main className="container section">
        <h1>Choose your demo role</h1>
        <p>Sign in to explore this workspace.</p>
        <Link to="/login" className="button">
          Demo Sign In
        </Link>
      </main>
    );
  if (customer ? actor.role !== "customer" : actor.role === "customer")
    return (
      <main className="container section">
        <h1>Permission denied</h1>
        <p>This page belongs to a different role.</p>
        <Link to="/demo" className="button">
          Switch demo role
        </Link>
      </main>
    );
  return (
    <>
      <WorkspaceNav />
      <Outlet />
    </>
  );
}
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="container section">
        <h1>Something went wrong</h1>
        <p>Your saved demo has not been deleted. Reload to try again.</p>
        <button onClick={() => location.reload()}>Reload</button>
      </main>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <BrowserRouter>
          <a className="skip-link" href="#content">
            Skip to content
          </a>
          <Header />
          <div id="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/login" element={<Demo />} />
              <Route path="/courses" element={<Catalogue />} />
              <Route path="/courses/:courseId" element={<CourseDetail />} />
              <Route element={<Protected customer />}>
                <Route path="/portal" element={<Portal />} />
                <Route path="/portal/profile" element={<CustomerProfile />} />
                <Route path="/portal/training" element={<CustomerTraining />} />
                <Route
                  path="/portal/bookings/:bookingId"
                  element={<BookingDetail />}
                />
              </Route>
              <Route element={<Protected />}>
                <Route path="/app" element={<WorkspaceHome />} />
                <Route path="/app/customers" element={<CRM />} />
                <Route path="/app/enquiries" element={<Enquiries />} />
                <Route path="/app/new-booking" element={<ManualBooking />} />
                <Route path="/app/training" element={<Training />} />
                <Route path="/app/equipment" element={<Equipment />} />
                <Route path="/app/staffing" element={<Staffing />} />
                <Route path="/app/settings" element={<Configuration />} />
                <Route path="/app/reports" element={<Reports />} />
                <Route path="/app/dashboard" element={<ManagerDashboard />} />
                <Route path="/app/mvp-reports" element={<MvpReports />} />
                <Route
                  path="/app/notifications"
                  element={<NotificationCenter />}
                />
                <Route path="/app/products" element={<ProductManagement />} />
                <Route path="/app/resources" element={<ResourceManagement />} />
                <Route path="/app/system" element={<SystemSettings />} />
                <Route path="/app/audit" element={<AuditHistory />} />
                <Route path="/app/calendar" element={<Calendar />} />
              </Route>
              <Route
                path="*"
                element={
                  <main className="container section">
                    <h1>Looks like uncharted water.</h1>
                    <p>We couldn’t find that page.</p>
                    <Link to="/" className="button">
                      Back to DiveOS
                    </Link>
                  </main>
                }
              />
            </Routes>
          </div>
          <Footer />
        </BrowserRouter>
      </StoreProvider>
    </ErrorBoundary>
  );
}
