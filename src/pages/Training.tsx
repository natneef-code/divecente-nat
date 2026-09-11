import { useState } from "react";
import { useStore } from "../data/store";
import {
  type Enrolment,
  trainingStates,
  type TrainingStatus,
  dateLabel,
} from "../domain/model";
import { saveTraining, staffName } from "../domain/operations";
import { Badge, Empty, PageTitle } from "../ui";
import { useAction, Field, Denied } from "./operation-ui";
function TrainingCard({ enrolment }: { enrolment: Enrolment }) {
  const { state, actor } = useStore();
  const { run, feedback } = useAction();
  const [form, setForm] = useState(enrolment);
  const b = state.bookings.find((b) => b.id === enrolment.bookingId)!;
  const p = b.participants.find((p) => p.id === enrolment.participantId)!;
  const activity = state.activities.find((a) => a.id === b.activityId)!;
  const c = state.courses.find((c) => c.id === activity.courseId)!;
  const labels = [
    "Preparation & knowledge",
    "Practical skill session",
    "Final review & debrief",
  ];
  return (
    <form
      className="panel"
      onSubmit={(e) => {
        e.preventDefault();
        run(
          (s, a) => saveTraining(s, a, enrolment.id, form),
          "Training record saved. No official certification is issued.",
        );
      }}
    >
      <div className="panel-heading">
        <div>
          <div className="eyebrow">
            {c.name} · {dateLabel(activity.date)}
          </div>
          <h2>{p.name}</h2>
        </div>
        <Badge>{enrolment.status}</Badge>
      </div>
      <p className="muted">
        Assigned instructor: {staffName(state, activity.instructorId)} · Medical
        operational status: {p.medical}. Demo milestones are internal
        placeholders, not agency training content.
      </p>
      <div className="training-checks">
        <div>
          <h3>Attendance</h3>
          {labels.map((label, i) => (
            <label className="check-row" key={label}>
              <input
                type="checkbox"
                checked={form.attendance[i]}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    attendance: f.attendance.map((v, n) =>
                      n === i ? e.target.checked : v,
                    ),
                  }))
                }
              />
              {label} attendance
            </label>
          ))}
        </div>
        <div>
          <h3>Milestones</h3>
          {labels.map((label, i) => (
            <label className="check-row" key={label}>
              <input
                type="checkbox"
                checked={form.milestones[i]}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    milestones: f.milestones.map((v, n) =>
                      n === i ? e.target.checked : v,
                    ),
                  }))
                }
              />
              {label} milestone
            </label>
          ))}
        </div>
      </div>
      <div className="form-grid">
        <Field
          label="Training status"
          value={form.status}
          onChange={(status) =>
            setForm((f) => ({ ...f, status: status as TrainingStatus }))
          }
        >
          {trainingStates
            .filter(
              (s) => actor?.role === "manager" || s !== "Processed externally",
            )
            .map((s) => (
              <option key={s}>{s}</option>
            ))}
        </Field>
        <Field
          label="Instructor notes / problems — no sensitive health details"
          value={form.notes}
          type="textarea"
          onChange={(notes) => setForm((f) => ({ ...f, notes }))}
        />
      </div>
      {feedback}
      <button className="form-spacer">Save training progress</button>
    </form>
  );
}
export function Training() {
  const { actor, state } = useStore();
  if (actor?.role !== "manager" && actor?.role !== "instructor")
    return <Denied />;
  const enrolments = state.enrolments.filter((e) => {
    const b = state.bookings.find((b) => b.id === e.bookingId);
    return (
      b &&
      !["Cancelled", "Refunded", "No-show"].includes(b.status) &&
      (actor.role === "manager" ||
        state.activities.find((a) => a.id === b.activityId)?.instructorId ===
          actor.id)
    );
  });
  return (
    <main className="container section">
      <PageTitle
        eyebrow="INTERNAL TRAINING WORKFLOW"
        title="Follow every student's progress."
        description="Record attendance, milestones and instructor notes. Ready for SSI processing is an internal handoff only; no certification is issued."
      />
      {enrolments.length ? (
        enrolments.map((e) => <TrainingCard key={e.id} enrolment={e} />)
      ) : (
        <Empty title="No assigned training yet.">
          Create a booking and manually assign an instructor to its activity.
        </Empty>
      )}
    </main>
  );
}
export function CustomerTraining() {
  const { state, actor } = useStore();
  const enrolments = state.enrolments.filter(
    (e) =>
      state.bookings.find((b) => b.id === e.bookingId)?.customerId ===
      actor?.customerId,
  );
  return (
    <main className="container section">
      <PageTitle
        eyebrow="CUSTOMER PORTAL"
        title="Your progress, one step at a time."
        description="These are fictional internal training records, not official certifications."
      />
      {enrolments.length ? (
        enrolments.map((e) => {
          const b = state.bookings.find((b) => b.id === e.bookingId)!;
          const p = b.participants.find((p) => p.id === e.participantId)!;
          return (
            <section className="panel" key={e.id}>
              <div className="panel-heading">
                <h2>{p.name}</h2>
                <Badge>{e.status}</Badge>
              </div>
              <p>
                {e.attendance.filter(Boolean).length} / 3 attendance records ·{" "}
                {e.milestones.filter(Boolean).length} / 3 milestones
              </p>
              <div className="capacity-bar">
                <span
                  style={{
                    width: `${(e.milestones.filter(Boolean).length / 3) * 100}%`,
                  }}
                />
              </div>
            </section>
          );
        })
      ) : (
        <Empty title="Your learning journey starts with a booking.">
          Choose a course to create an internal enrolment.
        </Empty>
      )}
    </main>
  );
}
