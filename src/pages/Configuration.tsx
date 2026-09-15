import { useState } from "react";
import { useStore } from "../data/store";
import {
  type StaffingRule,
  STANDARD_EQUIPMENT,
  type Course,
} from "../domain/model";
import { saveSettings, saveRule, saveBoatCapacity } from "../domain/staffing";
import { saveCourse, operationalAlerts } from "../domain/operations";
import { paid, balance } from "../domain/commands";
import { money } from "../domain/model";
import { PageTitle } from "../ui";
import { Field, useAction, Denied } from "./operation-ui";
function ProductForm({ course }: { course: Course }) {
  const [form, setForm] = useState(course);
  const { run, feedback } = useAction();
  return (
    <form
      className="panel"
      onSubmit={(e) => {
        e.preventDefault();
        run(
          (s, a) => saveCourse(s, a, form),
          "Product saved; existing bookings retain their prices.",
        );
      }}
    >
      <h2>{course.name}</h2>
      <div className="form-grid">
        <Field
          label="Product name"
          value={form.name}
          onChange={(name) => setForm({ ...form, name })}
        />
        <Field
          label="Price THB"
          type="number"
          min={0}
          step="0.01"
          value={form.price / 100}
          onChange={(v) =>
            setForm({ ...form, price: Math.round(Number(v) * 100) })
          }
        />
        <Field
          label="Deposit percent"
          type="number"
          min={0}
          max={100}
          value={form.depositBps / 100}
          onChange={(v) =>
            setForm({ ...form, depositBps: Math.round(Number(v) * 100) })
          }
        />
        <Field
          label="Product participant maximum"
          type="number"
          min={1}
          max={100}
          value={form.capacity}
          onChange={(v) => setForm({ ...form, capacity: Number(v) })}
        />
      </div>
      <label className="check-row">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
        />
        Published
      </label>
      {feedback}
      <button>Save product</button>
    </form>
  );
}
export function Configuration() {
  const { state, actor } = useStore();
  const { run, feedback } = useAction();
  const [settings, setSettings] = useState(state.settings);
  const [target, setTarget] = useState<
    "course" | "activity" | "session" | "site"
  >("course");
  const [key, setKey] = useState(state.courses[0].id);
  const [rule, setRule] = useState<StaffingRule>({});
  const [capacity, setCapacity] = useState(8);
  const [wet, setWet] = useState(true);
  const [included, setIncluded] = useState<string[]>([...STANDARD_EQUIPMENT]);
  const [boat, setBoat] = useState(state.boats[0].id);
  const [boatCapacity, setBoatCapacity] = useState(state.boats[0].capacity);
  const [product, setProduct] = useState(state.courses[0].id);
  if (actor?.role !== "manager") return <Denied />;
  function loadRule(v: string) {
    setKey(v);
    const record =
      target === "course"
        ? state.courses.find((x) => x.id === v)
        : target === "activity"
          ? state.activities.find((x) => x.id === v)
          : target === "session"
            ? state.sessions.find((x) => x.id === v)
            : state.diveSites.find((x) => x.id === v);
    if (!record) return;
    setRule(record.staffing || {});
    if ("capacity" in record) setCapacity(record.capacity);
    if ("inWater" in record) setWet(!!record.inWater);
    if ("includedEquipment" in record)
      setIncluded(record.includedEquipment || []);
  }
  const options =
    target === "course"
      ? state.courses.map((x) => ({ id: x.id, label: x.name }))
      : target === "activity"
        ? state.activities.map((x) => ({
            id: x.id,
            label: `${state.courses.find((c) => c.id === x.courseId)?.name} · ${x.date}`,
          }))
        : target === "session"
          ? state.sessions.map((x) => ({
              id: x.id,
              label: `${state.courses.find((c) => c.id === state.activities.find((a) => a.id === x.activityId)?.courseId)?.name} · ${x.date}`,
            }))
          : state.diveSites.map((x) => ({ id: x.id, label: x.name }));
  return (
    <main className="container section">
      <PageTitle
        eyebrow="MANAGER CONFIGURATION"
        title="Rules that match your operation."
        description="Demo rental, Fun Dive and Refresher fees are fictional assumptions. Changes affect new booking quotes; historical financial snapshots stay intact."
      />
      {feedback}
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          run((s, a) => saveSettings(s, a, settings), "Settings saved.");
        }}
      >
        <h2>Rental packages & operational defaults</h2>
        <div className="form-grid">
          <Field
            label="Participants per professional"
            type="number"
            min={1}
            max={20}
            value={settings.defaultStaffingRatio}
            onChange={(v) =>
              setSettings({ ...settings, defaultStaffingRatio: Number(v) })
            }
          />
          <Field
            label="Refresher threshold months"
            type="number"
            min={1}
            max={24}
            value={settings.refresherMonths}
            onChange={(v) =>
              setSettings({ ...settings, refresherMonths: Number(v) })
            }
          />
          {(
            [
              ["refresherPrice", "Refresher fee THB"],
              ["computerDailyPrice", "Dive computer daily THB"],
              ["fullPackageDailyPrice", "Full package daily THB"],
            ] as const
          ).map(([k, label]) => (
            <Field
              key={k}
              label={label}
              type="number"
              min={0}
              step="0.01"
              value={settings[k] / 100}
              onChange={(v) =>
                setSettings({ ...settings, [k]: Math.round(Number(v) * 100) })
              }
            />
          ))}
          {Object.entries(settings.individualDailyPrices).map(([k, v]) => (
            <Field
              key={k}
              label={`${k} daily THB`}
              type="number"
              min={0}
              step="0.01"
              value={v / 100}
              onChange={(v) =>
                setSettings({
                  ...settings,
                  individualDailyPrices: {
                    ...settings.individualDailyPrices,
                    [k]: Math.round(Number(v) * 100),
                  },
                })
              }
            />
          ))}
        </div>
        <fieldset>
          <legend>Fun Dive full package contents</legend>
          {STANDARD_EQUIPMENT.map((x) => (
            <label className="check-row" key={x}>
              <input
                type="checkbox"
                checked={settings.equipmentPackage.includes(x)}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    equipmentPackage: e.target.checked
                      ? [...settings.equipmentPackage, x]
                      : settings.equipmentPackage.filter((c) => c !== x),
                  })
                }
              />
              {x}
            </label>
          ))}
        </fieldset>
        <button>Save operational settings</button>
      </form>
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            (s, a) =>
              saveRule(
                s,
                a,
                target,
                key,
                rule,
                target === "session" ? undefined : capacity,
                wet,
                included,
              ),
            "Rules saved; readiness must be reviewed again.",
          );
        }}
      >
        <h2>Stricter staffing & capacity overrides</h2>
        <p>
          Leave a rule blank to inherit. Effective ratios take the smallest
          value; minimum staffing takes the largest. Participant maxima, site
          and boat limits remain separate. Saving replaces this target’s
          overrides.
        </p>
        <div className="form-grid">
          <Field
            label="Rule scope"
            value={target}
            onChange={(v) => {
              setTarget(v as typeof target);
              setKey("");
              setRule({});
            }}
          >
            <option value="course">Course Template</option>
            <option value="activity">Trip / Activity</option>
            <option value="session">Session</option>
            <option value="site">Dive Site</option>
          </Field>
          <Field label="Rule target" value={key} onChange={loadRule} required>
            <option value="">Select target</option>
            {options.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </Field>
          {(
            [
              ["ratio", "Ratio override"],
              ["minimum", "Minimum professionals"],
              ["maximum", "Maximum participants override"],
            ] as const
          ).map(([k, label]) => (
            <Field
              key={k}
              label={label}
              type="number"
              min={1}
              max={k === "maximum" ? 100 : 50}
              value={rule[k] ?? ""}
              onChange={(v) =>
                setRule({ ...rule, [k]: v === "" ? undefined : Number(v) })
              }
            />
          ))}
          {target !== "session" && (
            <Field
              label="Participant capacity"
              type="number"
              min={1}
              max={100}
              value={capacity}
              onChange={(v) => setCapacity(Number(v))}
            />
          )}
        </div>
        {(target === "course" || target === "session") && (
          <label className="check-row">
            <input
              type="checkbox"
              checked={wet}
              onChange={(e) => setWet(e.target.checked)}
            />
            In-water equipment inclusion · standard five items included without
            surcharge
          </label>
        )}
        {(target === "course" || target === "session") && (
          <fieldset>
            <legend>
              Additional / dry-session equipment included in price
            </legend>
            <p>
              All five standard items remain included when any course session is
              in water.
            </p>
            {STANDARD_EQUIPMENT.map((x) => (
              <label className="check-row" key={x}>
                <input
                  type="checkbox"
                  checked={included.includes(x)}
                  onChange={(e) =>
                    setIncluded(
                      e.target.checked
                        ? [...included, x]
                        : included.filter((c) => c !== x),
                    )
                  }
                />
                {x}
              </label>
            ))}
          </fieldset>
        )}
        <button>Save rules</button>
      </form>
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            (s, a) => saveBoatCapacity(s, a, boat, boatCapacity),
            "Boat capacity saved.",
          );
        }}
      >
        <h2>Boat passenger capacity</h2>
        <div className="form-grid">
          <Field
            label="Boat"
            value={boat}
            onChange={(v) => {
              setBoat(v);
              setBoatCapacity(state.boats.find((b) => b.id === v)!.capacity);
            }}
          >
            {state.boats.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Field>
          <Field
            label="Boat capacity"
            type="number"
            min={1}
            max={100}
            value={boatCapacity}
            onChange={(v) => setBoatCapacity(Number(v))}
          />
        </div>
        <button className="form-spacer">Save boat capacity</button>
      </form>
      <Field label="Product to edit" value={product} onChange={setProduct}>
        {state.courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Field>
      <ProductForm
        key={product}
        course={state.courses.find((c) => c.id === product)!}
      />
    </main>
  );
}
export function Reports() {
  const { state, actor } = useStore();
  if (actor?.role !== "manager") return <Denied />;
  return (
    <main className="container section">
      <PageTitle
        eyebrow="MANAGER REPORTS"
        title="Your operation, in view."
        description="Live totals from this browser’s fictional records. No accounting or messaging provider is connected."
      />
      <div className="stat-grid">
        <div>
          <span>Payments received</span>
          <strong>
            {money(state.bookings.reduce((n, b) => n + paid(state, b.id), 0))}
          </strong>
        </div>
        <div>
          <span>Outstanding balances</span>
          <strong>
            {money(state.bookings.reduce((n, b) => n + balance(state, b), 0))}
          </strong>
        </div>
        <div>
          <span>Training enrolments</span>
          <strong>{state.enrolments.length}</strong>
        </div>
      </div>
      <section className="panel">
        <h2>Operational alerts</h2>
        {operationalAlerts(state).map((x) => (
          <p key={x.id}>
            {x.kind}: {x.message}
          </p>
        ))}
      </section>
      <section className="panel">
        <h2>Notification previews · simulated</h2>
        {state.notifications.length ? (
          state.notifications.map((n) => (
            <p key={n.id}>
              <strong>{n.type}</strong> · {n.message} · {n.channels.join(", ")}{" "}
              · not sent
            </p>
          ))
        ) : (
          <p>No notification events yet.</p>
        )}
      </section>
      <section className="panel">
        <h2>Audit history</h2>
        {state.events.map((e) => (
          <p key={e.id}>
            {e.at} · {e.actorId} · {e.action}
          </p>
        ))}
      </section>
    </main>
  );
}
