import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../data/store";
import { dateLabel } from "../domain/model";
import { hasAssignment, isProfessional } from "../domain/policies";
import {
  addManifestGroup,
  applySeatSuggestions,
  assignManifestSeat,
  manifestFor,
  manifestOccupants,
  removeManifestGroup,
  setBoatSeatUnavailable,
} from "../domain/operationsUx";
import { Badge, Empty, PageTitle } from "../ui";
import { Denied, Field, useAction } from "./operation-ui";

const activeBooking = (status: string) =>
  !["Cancelled", "Refunded", "No-show"].includes(status);

export function BoatManifestPage() {
  const { state, actor } = useStore();
  const editable = actor?.role === "frontdesk" || actor?.role === "manager";
  const activities = state.activities.filter(
    (activity) =>
      !!actor &&
      (editable ||
        (isProfessional(actor) && hasAssignment(state, actor, activity.id))),
  );
  const [activityId, setActivityId] = useState(activities[0]?.id || "");
  const activity =
    activities.find((row) => row.id === activityId) ?? activities[0];
  const [boatId, setBoatId] = useState(
    activity?.boatId || state.boats[0]?.id || "",
  );
  const [bookingId, setBookingId] = useState("");
  const [blockedSeat, setBlockedSeat] = useState(1);
  const { run, feedback } = useAction();
  if (!actor || actor.role === "customer") return <Denied />;
  if (!activity)
    return (
      <main className="container section">
        <Empty title="No boat trips available">
          Assigned operational activities appear here.
        </Empty>
      </main>
    );
  const manifest = manifestFor(state, activity.id, boatId);
  const boat = state.boats.find((row) => row.id === manifest.boatId)!;
  const occupants = manifestOccupants(state, manifest);
  const assigned = manifest.seats.length;
  const unassigned = occupants.filter(
    (person) => !manifest.seats.some((seat) => seat.occupantId === person.id),
  );
  const duplicate =
    new Set(manifest.seats.map((seat) => seat.seat)).size !==
    manifest.seats.length;
  const blocked = duplicate || occupants.length > boat.capacity;
  const warning = !blocked && unassigned.length > 0;
  const status = blocked ? "Blocked" : warning ? "Warning" : "Ready";
  const eligibleBookings = state.bookings.filter(
    (booking) =>
      booking.activityId === activity.id && activeBooking(booking.status),
  );
  return (
    <main className="container section">
      <PageTitle
        eyebrow="BOAT TRIPS & PASSENGER SEATING"
        title="A seat and a place for every passenger."
        description="Customers and assigned dive professionals occupy seats. Boat crew remains an operator decision. Front Desk and Manager confirm every manifest change."
      />
      <div className="filter-bar">
        <Field
          label="Boat activity"
          value={activity.id}
          onChange={(value) => {
            setActivityId(value);
            const next = activities.find((row) => row.id === value);
            if (next?.boatId) setBoatId(next.boatId);
          }}
        >
          {activities.map((row) => (
            <option value={row.id} key={row.id}>
              {state.courses.find((course) => course.id === row.courseId)?.name}{" "}
              · {row.date} · {row.time}
            </option>
          ))}
        </Field>
        <Field label="Boat" value={boatId} onChange={setBoatId}>
          {state.boats
            .filter((row) => row.active !== false && row.name !== "Shore-based")
            .map((row) => (
              <option value={row.id} key={row.id}>
                {row.name} · {row.capacity} seats
              </option>
            ))}
        </Field>
        <Link
          className="button secondary"
          to={`/app/staffing?activity=${activity.id}`}
        >
          Open operational detail
        </Link>
      </div>
      <div className="stat-grid">
        <div>
          <span>Total capacity</span>
          <strong>{boat.capacity}</strong>
        </div>
        <div>
          <span>Seats assigned</span>
          <strong>{assigned}</strong>
        </div>
        <div>
          <span>Seats available</span>
          <strong>
            {Math.max(
              0,
              boat.capacity - assigned - (boat.unavailableSeats?.length || 0),
            )}
          </strong>
        </div>
        <div>
          <span>Unassigned passengers</span>
          <strong>{unassigned.length}</strong>
        </div>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">
              {dateLabel(activity.date)} · DEPARTURE {activity.time}
            </span>
            <h2>
              {boat.name} → {activity.site}
            </h2>
          </div>
          <Badge>{status}</Badge>
        </div>
        {blocked && (
          <p className="error">
            Duplicate seating or boat capacity conflict blocks readiness.
          </p>
        )}
        {warning && (
          <p className="notice">
            Assign every operational passenger a seat before departure.
          </p>
        )}
        {feedback}
        {editable && (
          <form
            className="filter-bar"
            onSubmit={(event) => {
              event.preventDefault();
              run(
                (store, currentActor) =>
                  addManifestGroup(
                    store,
                    currentActor,
                    activity.id,
                    boat.id,
                    bookingId,
                  ),
                "Booking group added to this boat.",
              );
            }}
          >
            <Field
              label="Add or move booking group"
              value={bookingId}
              onChange={setBookingId}
              required
            >
              <option value="">Select booking</option>
              {eligibleBookings.map((booking) => (
                <option value={booking.id} key={booking.id}>
                  {booking.participants.map((person) => person.name).join(", ")}
                </option>
              ))}
            </Field>
            <button>Add or move group</button>
          </form>
        )}
      </section>
      <div className="manifest-layout">
        <section className="panel">
          <h2>Groups and passengers</h2>
          {manifest.bookingIds.map((id) => {
            const booking = state.bookings.find((row) => row.id === id);
            if (!booking) return null;
            return (
              <article className="manifest-group" key={id}>
                <div className="panel-heading">
                  <h3>Booking {id.slice(0, 8).toUpperCase()}</h3>
                  {editable && (
                    <button
                      className="small secondary"
                      onClick={() =>
                        run(
                          (store, currentActor) =>
                            removeManifestGroup(
                              store,
                              currentActor,
                              manifest.id,
                              id,
                            ),
                          "Booking group removed; audit retained.",
                        )
                      }
                    >
                      Remove group
                    </button>
                  )}
                </div>
                {booking.participants.map((person) => (
                  <PassengerRow
                    key={person.id}
                    person={{
                      id: person.id,
                      name: person.name,
                      type: "participant",
                    }}
                    manifestId={manifest.id}
                    seat={
                      manifest.seats.find((row) => row.occupantId === person.id)
                        ?.seat
                    }
                    capacity={boat.capacity}
                    editable={editable}
                  />
                ))}
                {editable &&
                  booking.participants.some(
                    (person) =>
                      !manifest.seats.some(
                        (seat) => seat.occupantId === person.id,
                      ),
                  ) && (
                    <button
                      className="small"
                      onClick={() =>
                        run(
                          (store, currentActor) =>
                            applySeatSuggestions(
                              store,
                              currentActor,
                              manifest.id,
                              id,
                            ),
                          "Consecutive group seats confirmed.",
                        )
                      }
                    >
                      Suggest and confirm consecutive seats
                    </button>
                  )}
              </article>
            );
          })}
          <h3>Assigned dive team</h3>
          {occupants
            .filter((person) => person.type === "professional")
            .map((person) => (
              <PassengerRow
                key={person.id}
                person={person}
                manifestId={manifest.id}
                seat={
                  manifest.seats.find((row) => row.occupantId === person.id)
                    ?.seat
                }
                capacity={boat.capacity}
                editable={editable}
              />
            ))}
        </section>
        <section className="panel">
          <h2>Seat map · 1–{boat.capacity}</h2>
          <div className="seat-map">
            {Array.from({ length: boat.capacity }, (_, index) => index + 1).map(
              (seat) => {
                const assignment = manifest.seats.find(
                  (row) => row.seat === seat,
                );
                const occupant = occupants.find(
                  (row) => row.id === assignment?.occupantId,
                );
                const unavailable = boat.unavailableSeats?.includes(seat);
                return (
                  <div
                    className={`seat ${assignment ? "assigned" : unavailable ? "unavailable" : ""}`}
                    key={seat}
                  >
                    <strong>{seat}</strong>
                    <small>
                      {occupant?.name ||
                        (unavailable ? "Unavailable" : "Available")}
                    </small>
                  </div>
                );
              },
            )}
          </div>
          {editable && (
            <form
              className="filter-bar"
              onSubmit={(event) => {
                event.preventDefault();
                const unavailable = !(boat.unavailableSeats ?? []).includes(
                  blockedSeat,
                );
                run(
                  (store, currentActor) =>
                    setBoatSeatUnavailable(
                      store,
                      currentActor,
                      boat.id,
                      blockedSeat,
                      unavailable,
                    ),
                  `Seat ${blockedSeat} ${unavailable ? "blocked" : "released"}.`,
                );
              }}
            >
              <Field
                label="Operational seat"
                type="number"
                min={1}
                max={boat.capacity}
                value={blockedSeat}
                onChange={(value) => setBlockedSeat(Number(value))}
              />
              <button className="secondary">Block or release seat</button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

function PassengerRow({
  person,
  manifestId,
  seat,
  capacity,
  editable,
}: {
  person: { id: string; name: string; type: "participant" | "professional" };
  manifestId: string;
  seat?: number;
  capacity: number;
  editable: boolean;
}) {
  const [nextSeat, setNextSeat] = useState(seat || 1);
  const { run, feedback } = useAction();
  return (
    <div className="passenger-row">
      <div>
        <strong>{person.name}</strong>
        <small>
          {person.type === "professional"
            ? "Instructor / Divemaster"
            : "Customer participant"}
        </small>
      </div>
      <Badge>{seat ? `Seat ${seat}` : "Unassigned"}</Badge>
      {editable && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            run(
              (store, actor) =>
                assignManifestSeat(
                  store,
                  actor,
                  manifestId,
                  person.id,
                  nextSeat,
                ),
              `Seat ${nextSeat} assigned.`,
            );
          }}
        >
          <Field
            label={`Seat for ${person.name}`}
            type="number"
            min={1}
            max={capacity}
            value={nextSeat}
            onChange={(value) => setNextSeat(Number(value))}
          />
          <button className="small">Assign seat</button>
        </form>
      )}
      {feedback}
    </div>
  );
}
