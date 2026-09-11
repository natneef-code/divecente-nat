import { useState } from "react";
import { useStore } from "../data/store";
import { type EquipmentItem, bangkokDate, dateLabel } from "../domain/model";
import { staff } from "../domain/commands";
import {
  allocateEquipment,
  moveEquipment,
  serviceEquipment,
  saveEquipment,
} from "../domain/operations";
import { equipmentCategories } from "../domain/records";
import { Badge, PageTitle } from "../ui";
import { Field, useAction, Denied } from "./operation-ui";
function AssetPanel({ item }: { item: EquipmentItem }) {
  const { state, actor } = useStore();
  const { run, feedback } = useAction();
  const [participant, setParticipant] = useState("");
  const [nextDue, setNextDue] = useState(item.nextMaintenance);
  const [notes, setNotes] = useState("");
  const [damage, setDamage] = useState("");
  const [form, setForm] = useState(item);
  const active = state.allocations.filter(
    (x) => x.itemId === item.id && x.status !== "Returned",
  );
  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">{item.id}</div>
          <h2>
            {item.category} · {item.size}
          </h2>
        </div>
        <Badge>{item.status}</Badge>
      </div>
      <p className="muted">
        {item.brand} / {item.model} · Serial: {item.serial}
        <br />
        Last inspection: {item.lastInspection} · Next maintenance:{" "}
        {item.nextMaintenance}
      </p>
      {item.damageNotes && <p className="error">Damage: {item.damageNotes}</p>}
      {feedback}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const [bookingId, participantId] = participant.split("|");
          run(
            (s, a) =>
              allocateEquipment(s, a, item.id, bookingId, participantId),
            "Equipment reserved for this participant.",
          );
        }}
      >
        <Field
          label="Allocate to participant"
          value={participant}
          onChange={setParticipant}
          required
        >
          <option value="">Select a participant</option>
          {state.bookings
            .filter(
              (b) =>
                !["Completed", "Cancelled", "Refunded", "No-show"].includes(
                  b.status,
                ),
            )
            .flatMap((b) =>
              b.participants.map((p) => (
                <option key={p.id} value={`${b.id}|${p.id}`}>
                  {p.name} ·{" "}
                  {dateLabel(
                    state.activities.find((x) => x.id === b.activityId)!.date,
                  )}
                </option>
              )),
            )}
        </Field>
        <button className="form-spacer">Reserve this item</button>
      </form>
      <h3>Current allocations</h3>
      {active.length === 0 ? (
        <p className="muted">No active allocations.</p>
      ) : (
        active.map((x) => {
          const b = state.bookings.find((b) => b.id === x.bookingId)!;
          const p = b.participants.find((p) => p.id === x.participantId)!;
          return (
            <div className="allocation" key={x.id}>
              <strong>{p.name}</strong>
              <Badge>{x.status}</Badge>
              <div className="actions compact">
                {x.status === "Reserved" && (
                  <button
                    className="small"
                    onClick={() =>
                      run(
                        (s, a) => moveEquipment(s, a, x.id, "Checked out"),
                        "Item checked out.",
                      )
                    }
                  >
                    Check out
                  </button>
                )}
                <button
                  className="small secondary"
                  onClick={() => {
                    if (
                      x.status === "Reserved" &&
                      !confirm("Release this equipment reservation?")
                    )
                      return;
                    run(
                      (s, a) => moveEquipment(s, a, x.id, "Returned", damage),
                      damage
                        ? "Returned; item marked damaged."
                        : "Item returned.",
                    );
                    setDamage("");
                  }}
                >
                  {x.status === "Reserved"
                    ? "Release reservation"
                    : "Return item"}
                </button>
              </div>
            </div>
          );
        })
      )}
      {active.some((x) => x.status === "Checked out") && (
        <Field
          label="Damage report on return (optional)"
          type="textarea"
          value={damage}
          onChange={setDamage}
        />
      )}
      {actor?.role === "manager" && (
        <>
          <hr />
          <h3>Inventory details</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run((s, a) => saveEquipment(s, a, form), "Inventory item saved.");
            }}
          >
            <div className="form-grid">
              <Field
                label="Asset brand"
                value={form.brand}
                onChange={(brand) => setForm((f) => ({ ...f, brand }))}
              />
              <Field
                label="Asset model"
                value={form.model}
                onChange={(model) => setForm((f) => ({ ...f, model }))}
              />
              <Field
                label="Serial number"
                value={form.serial}
                onChange={(serial) => setForm((f) => ({ ...f, serial }))}
              />
              <Field
                label="Availability status"
                value={form.status}
                onChange={(status) =>
                  setForm((f) => ({
                    ...f,
                    status: status as EquipmentItem["status"],
                  }))
                }
              >
                {["Available", "Maintenance", "Damaged", "Lost", "Retired"].map(
                  (s) => (
                    <option key={s}>{s}</option>
                  ),
                )}
              </Field>
            </div>
            <button className="secondary form-spacer">
              Save inventory details
            </button>
          </form>
          <hr />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                run(
                  (s, a) => serviceEquipment(s, a, item.id, nextDue, notes),
                  "Maintenance recorded; item returned to service.",
                )
              )
                setNotes("");
            }}
          >
            <h3>Record maintenance</h3>
            <div className="stack-fields">
              <Field
                label="Next maintenance date"
                type="date"
                value={nextDue}
                onChange={setNextDue}
                required
              />
              <Field
                label="Service notes"
                type="textarea"
                value={notes}
                onChange={setNotes}
                required
              />
            </div>
            <button>Record maintenance</button>
          </form>
        </>
      )}
      <h3>Service history</h3>
      {state.maintenance
        .filter((m) => m.itemId === item.id)
        .map((m) => (
          <p className="muted" key={m.id}>
            {m.date} · {m.notes} · next due {m.nextDue}
          </p>
        ))}
    </div>
  );
}
export function Equipment() {
  const { state, actor } = useStore();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(state.equipmentItems[0]?.id || "");
  const { run, feedback } = useAction();
  if (!staff(actor)) return <Denied />;
  const item = state.equipmentItems.find((i) => i.id === selected);
  const rows = state.equipmentItems.filter(
    (i) =>
      (category === "all" || i.category === category) &&
      `${i.id} ${i.category} ${i.size}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <main className="container section">
      <PageTitle
        eyebrow="RENTAL EQUIPMENT"
        title="Every item, accounted for."
        description="Reserve individual assets, check them out, track returns and report damage. Overlapping allocations and overdue maintenance are blocked."
      />
      {feedback}
      <div className="filter-bar">
        <Field
          label="Equipment category"
          value={category}
          onChange={setCategory}
        >
          <option value="all">All categories</option>
          {Object.keys(equipmentCategories).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Field>
        <Field label="Search inventory" value={query} onChange={setQuery} />
        {actor?.role === "manager" && (
          <button
            className="secondary"
            onClick={() => {
              const sample = rows[0] || state.equipmentItems[0];
              const next = run(
                (s, a) =>
                  saveEquipment(s, a, {
                    ...sample,
                    id: "",
                    serial: "FICTIONAL-NEW",
                    status: "Available",
                    lastInspection: bangkokDate(),
                    nextMaintenance: state.staffMembers[0].availableTo,
                    damageNotes: "",
                  }),
                "New demo inventory item added.",
              );
              if (next) setSelected(next.equipmentItems.at(-1)!.id);
            }}
          >
            Add demo asset
          </button>
        )}
      </div>
      <div className="ops-columns inventory-columns">
        <section className="panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <strong>{i.category}</strong>
                      <small>{i.id}</small>
                    </td>
                    <td>{i.size}</td>
                    <td>
                      <Badge>{i.status}</Badge>
                    </td>
                    <td>
                      <button
                        className="small secondary"
                        aria-label={`Manage ${i.id}`}
                        onClick={() => setSelected(i.id)}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && <p>No matching inventory.</p>}
        </section>
        {item && (
          <AssetPanel key={`${item.id}-${item.updatedAt}`} item={item} />
        )}
      </div>
    </main>
  );
}
