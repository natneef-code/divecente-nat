import { useState } from "react";
import { useStore } from "../data/store";
import {
  type Activity,
  type Booking,
  type Participant,
  type Session,
  dateLabel,
} from "../domain/model";
import { staff } from "../domain/commands";
import {
  assignedIds,
  effectiveRules,
  hasAssignment,
  isProfessional,
  operationalReadiness,
  sessionsFor,
  staffingSummary,
} from "../domain/policies";
import {
  addOperationalNote,
  assignTeam,
  markReady,
  updateRefresher,
} from "../domain/staffing";
import { Field, useAction } from "./operation-ui";
import { Badge, PageTitle, Empty } from "../ui";
function RefresherRow({
  booking,
  person,
}: {
  booking: Booking;
  person: Participant;
}) {
  const { actor, state } = useStore();
  const { run, feedback } = useAction();
  const [date, setDate] = useState(
    person.refresher?.scheduledFor ||
      state.activities.find((x) => x.id === booking.activityId)!.date,
  );
  const [reason, setReason] = useState("");
  const r = person.refresher!;
  return (
    <section className="document-note">
      <h3>{person.name} · Mandatory Refresher</h3>
      <Badge>{r.status}</Badge>
      <p>
        Required after a gap greater than {r.thresholdMonths} calendar months.{" "}
        {r.scheduledFor && `Scheduled: ${dateLabel(r.scheduledFor)}.`}{" "}
        {r.overrideReason && `Manager override: ${r.overrideReason}`}
      </p>
      {feedback}
      {["Required", "Scheduled"].includes(r.status) && (
        <form
          className="actions"
          onSubmit={(e) => {
            e.preventDefault();
            run(
              (s, a) =>
                updateRefresher(s, a, booking.id, person.id, "schedule", date),
              "Refresher scheduled.",
            );
          }}
        >
          <Field
            label={`Refresher date for ${person.name}`}
            type="date"
            value={date}
            onChange={setDate}
            required
          />
          <button>Schedule Refresher</button>
        </form>
      )}
      {actor && isProfessional(actor) && r.status === "Scheduled" && (
        <button
          onClick={() =>
            run(
              (s, a) =>
                updateRefresher(s, a, booking.id, person.id, "complete"),
              "Refresher completion recorded.",
            )
          }
        >
          Record Refresher completed
        </button>
      )}
      {actor?.role === "manager" &&
        !["Completed", "Overridden"].includes(r.status) && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                confirm(
                  "Record this Manager override while preserving the required Refresher and its fee?",
                )
              )
                run(
                  (s, a) =>
                    updateRefresher(
                      s,
                      a,
                      booking.id,
                      person.id,
                      "override",
                      "",
                      reason,
                    ),
                  "Override recorded in audit history.",
                );
            }}
          >
            <Field
              label={`Override reason for ${person.name}`}
              value={reason}
              onChange={setReason}
              required
            />
            <button className="secondary form-spacer">
              Record Manager override
            </button>
          </form>
        )}
    </section>
  );
}
export function Refreshers({ booking }: { booking: Booking }) {
  return (
    <>
      {booking.participants
        .filter((p) => p.refresher)
        .map((p) => (
          <RefresherRow key={p.id} booking={booking} person={p} />
        ))}
    </>
  );
}
function TeamForm({
  activity,
  session,
}: {
  activity: Activity;
  session?: Session;
}) {
  const { state } = useStore();
  const { run, feedback } = useAction();
  const [ids, setIds] = useState(assignedIds(state, activity, session));
  const [lead, setLead] = useState(
    session?.leadId ?? activity.leadId ?? activity.instructorId ?? "",
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(
          (s, a) =>
            assignTeam(s, a, activity.id, ids, lead || null, session?.id),
          "Manual team assignment saved.",
        );
      }}
    >
      <fieldset>
        <legend>
          {session ? `Session team · ${session.date}` : "Activity default team"}
        </legend>
        {state.staffMembers
          .filter((p) => ["instructor", "divemaster"].includes(p.role))
          .map((p) => (
            <label className="check-row" key={p.id}>
              <input
                type="checkbox"
                checked={ids.includes(p.id)}
                onChange={(e) => {
                  setIds(
                    e.target.checked
                      ? [...ids, p.id]
                      : ids.filter((id) => id !== p.id),
                  );
                  if (!e.target.checked && lead === p.id) setLead("");
                }}
              />
              {p.name} · {p.role === "instructor" ? "Instructor" : "Divemaster"}
              {!p.active ? " · inactive" : ""}
            </label>
          ))}
        <Field
          label={session ? `Lead for ${session.date}` : "Activity lead"}
          value={lead}
          onChange={setLead}
        >
          <option value="">Select lead</option>
          {state.staffMembers
            .filter((p) => ids.includes(p.id))
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </Field>
        {feedback}
        <button className="form-spacer">
          {session ? "Save session team" : "Save activity team"}
        </button>
      </fieldset>
    </form>
  );
}
export function Staffing() {
  const { state, actor } = useStore();
  const [key, setKey] = useState("");
  const [note, setNote] = useState("");
  const { run, feedback } = useAction();
  const activities = state.activities.filter(
    (a) => actor && (staff(actor) || hasAssignment(state, actor, a.id)),
  );
  const activity = activities.find((a) => a.id === key) || activities[0];
  if (!activity)
    return (
      <main className="container section">
        <Empty title="No assigned activities">
          Front Desk can assign a qualified team.
        </Empty>
      </main>
    );
  const summary = operationalReadiness(state, activity),
    rule = effectiveRules(state, activity);
  return (
    <main className="container section">
      <PageTitle
        eyebrow="STAFFING & READINESS"
        title="The right team for every dive."
        description="Participant capacity and professional coverage are separate. Stricter rules apply; in-water training always needs an Instructor. Assignment is manual."
      />
      <Field label="Activity to staff" value={activity.id} onChange={setKey}>
        {activities.map((a) => (
          <option key={a.id} value={a.id}>
            {state.courses.find((c) => c.id === a.courseId)?.name} · {a.date}
          </option>
        ))}
      </Field>
      <div className="stat-grid">
        <div>
          <span>Professionals required</span>
          <strong>{summary.required}</strong>
        </div>
        <div>
          <span>Qualified & available</span>
          <strong>{summary.assigned}</strong>
        </div>
        <div>
          <span>Missing professionals</span>
          <strong>{summary.missing}</strong>
        </div>
        <div>
          <span>Participant maximum</span>
          <strong>
            {Math.min(
              rule.capacity,
              ...summary.evaluations.map((x) => x.capacity),
            )}
          </strong>
        </div>
      </div>
      <section className="panel">
        <Badge>
          {summary.ready ? activity.readinessStatus || "Draft" : "Not ready"}
        </Badge>
        <p>
          Default {state.settings.defaultStaffingRatio}:1
          participant-to-professional ratio. Site: {activity.site} · Boat:{" "}
          {activity.boat}. Equipment availability is checked separately.
        </p>
        {summary.issues.map((x) => (
          <p className="error" key={x}>
            {x}
          </p>
        ))}
        {feedback}
        {staff(actor) && (
          <button
            disabled={!summary.ready}
            onClick={() =>
              run(
                (s, a) => markReady(s, a, activity.id),
                "Activity marked operationally ready.",
              )
            }
          >
            Mark operationally ready
          </button>
        )}
      </section>
      <div className="ops-columns">
        <div>
          {staff(actor) && <TeamForm key={activity.id} activity={activity} />}
        </div>
        <div>
          {sessionsFor(state, activity).map((session) => {
            const check = staffingSummary(state, activity, session);
            return (
              <section className="panel" key={session.id}>
                <h2>
                  {dateLabel(session.date)} · {session.time}–{session.endTime}
                </h2>
                <p>
                  {session.inWater ? "In-water session" : "Dry session"} ·
                  Required {check.required} / assigned {check.assigned} /
                  missing {check.missing}
                </p>
                <p>
                  Effective ratio:{" "}
                  {effectiveRules(state, activity, session).ratio}:1. Lead:{" "}
                  {state.staffMembers.find(
                    (p) => p.id === (session.leadId ?? activity.leadId),
                  )?.name || "Unassigned"}
                  . Team:{" "}
                  {assignedIds(state, activity, session)
                    .map((id) => {
                      const p = state.staffMembers.find((p) => p.id === id);
                      return `${p?.name || id} (${p?.role || "unknown"})`;
                    })
                    .join(", ") || "Unassigned"}
                  .
                </p>
                {check.issues.map((x) => (
                  <p className="error" key={x}>
                    {x}
                  </p>
                ))}
                {staff(actor) && (
                  <details>
                    <summary>Override session team</summary>
                    <TeamForm
                      key={`${session.id}-${activity.professionalIds?.join()}`}
                      activity={activity}
                      session={session}
                    />
                  </details>
                )}
              </section>
            );
          })}
        </div>
      </div>
      {state.bookings
        .filter(
          (b) =>
            b.activityId === activity.id &&
            !["Cancelled", "Refunded", "No-show"].includes(b.status),
        )
        .map((b) => (
          <Refreshers key={b.id} booking={b} />
        ))}
      <section className="panel">
        <h2>Operational notes</h2>
        <p>
          Fictional preparation or equipment issues only; no sensitive health or
          financial details.
        </p>
        {activity.operationalNotes?.map((n) => (
          <p key={n.id}>
            {n.at.slice(0, 10)} ·{" "}
            {state.staffMembers.find((p) => p.id === n.actorId)?.name ||
              n.actorId}
            : {n.text}
          </p>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              run(
                (s, a) => addOperationalNote(s, a, activity.id, note),
                "Operational note saved.",
              )
            )
              setNote("");
          }}
        >
          <Field
            label="Operational note"
            value={note}
            onChange={setNote}
            type="textarea"
            required
          />
          <button className="form-spacer">Save operational note</button>
        </form>
      </section>
    </main>
  );
}
