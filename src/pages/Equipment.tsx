import {
  canEquip,
  isProfessional,
  requestedEquipment,
} from "../domain/policies";
import { useState } from "react";
import { useStore } from "../data/store";
import { type EquipmentItem, dateLabel } from "../domain/model";
import { staff } from "../domain/commands";
import {
  allocateEquipment,
  correctAllocation,
  moveEquipment,
  serviceEquipment,
  saveEquipment,
} from "../domain/operations";
import { equipmentCategories } from "../domain/records";
import {
  bulkCreateEquipment,
  equipmentSummary,
  itemOperationalStatus,
} from "../domain/operationsUx";
import { Badge, PageTitle } from "../ui";
import { Field, useAction, Denied } from "./operation-ui";
function AssetPanel({ item }: { item: EquipmentItem }) {
  const { state, actor } = useStore();
  const { run, feedback } = useAction();
  const [participant, setParticipant] = useState("");
  const [nextDue, setNextDue] = useState(item.nextMaintenance);
  const [notes, setNotes] = useState("");
  const [damage, setDamage] = useState("");
  const [replacement, setReplacement] = useState("");
  const [reason, setReason] = useState("");
  const [form, setForm] = useState(item);
  const active = state.allocations.filter(
    (x) =>
      x.itemId === item.id &&
      x.status !== "Returned" &&
      !!actor &&
      canEquip(state, actor, x.activityId),
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
                !!actor &&
                canEquip(state, actor, b.activityId) &&
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
              {staff(actor) && x.status === "Reserved" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(
                      (s, a) =>
                        correctAllocation(s, a, x.id, replacement, reason),
                      "Assignment corrected; previous record retained.",
                    );
                  }}
                >
                  <Field
                    label="Replacement asset"
                    value={replacement}
                    onChange={setReplacement}
                    required
                  >
                    <option value="">Select replacement</option>
                    {state.equipmentItems
                      .filter(
                        (i) => i.category === item.category && i.id !== item.id,
                      )
                      .map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.id} · {i.size} · {i.status}
                        </option>
                      ))}
                  </Field>
                  <Field
                    label="Correction reason"
                    value={reason}
                    onChange={setReason}
                    required
                  />
                  <button className="secondary form-spacer">
                    Correct assignment
                  </button>
                </form>
              )}
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
      <h3>Allocation history</h3>
      {state.allocations
        .filter(
          (x) =>
            x.itemId === item.id &&
            actor &&
            canEquip(state, actor, x.activityId),
        )
        .map((x) => (
          <p className="muted" key={x.id}>
            {x.id.slice(0, 8)} · {x.status} · {x.returnedAt || x.createdAt}
          </p>
        ))}
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
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [size, setSize] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState("");
  const [page, setPage] = useState(1);
  const [bulk, setBulk] = useState({
    category: "Fins",
    size: "M",
    brand: "Demo",
    model: "Training series",
    prefix: "FIN-M",
    start: 1,
    count: 10,
  });
  const { run, feedback } = useAction();
  if (!actor || (!staff(actor) && !isProfessional(actor))) return <Denied />;
  const item = state.equipmentItems.find((i) => i.id === selected);
  const showAssets = !!size || !!query || !!status;
  const rows = showAssets
    ? state.equipmentItems.filter(
        (i) =>
          (!category || i.category === category) &&
          (!size || i.size === size) &&
          (!status || itemOperationalStatus(state, i) === status) &&
          `${i.id} ${i.category} ${i.size}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      )
    : [];
  const pageSize = 20;
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);
  const categories = [...new Set(state.equipmentItems.map((i) => i.category))];
  const sizes = [
    ...new Set(
      state.equipmentItems
        .filter((i) => !category || i.category === category)
        .map((i) => i.size),
    ),
  ];
  return (
    <main className="container section">
      <PageTitle
        eyebrow="RENTAL EQUIPMENT"
        title="Every item, accounted for."
        description="Start with a category, then a size or model group, and open an individual physical asset only when needed. Every asset remains uniquely tracked."
      />
      {feedback}
      {!category && !query ? (
        <div className="equipment-category-grid">
          {categories.map((name) => {
            const summary = equipmentSummary(state, name);
            return (
              <button
                className="equipment-summary"
                key={name}
                onClick={() => {
                  setCategory(name);
                  setSize("");
                  setPage(1);
                }}
              >
                <strong>{name}</strong>
                <span>
                  {summary.total} total · {summary.available} available
                </span>
                <small>
                  {summary.reserved} reserved · {summary.checkedOut} checked out
                  · {summary.maintenance} maintenance · {summary.damaged}{" "}
                  damaged · {summary.outOfService} out of service
                </small>
              </button>
            );
          })}
        </div>
      ) : category && !size && !query ? (
        <section className="panel">
          <div className="panel-heading">
            <h2>{category} groups</h2>
            <button className="secondary small" onClick={() => setCategory("")}>
              All categories
            </button>
          </div>
          <div className="equipment-category-grid">
            {sizes.map((name) => {
              const summary = equipmentSummary(state, category, name);
              return (
                <button
                  className="equipment-summary"
                  key={name}
                  onClick={() => {
                    setSize(name);
                    setPage(1);
                  }}
                >
                  <strong>{name}</strong>
                  <span>{summary.total} physical assets</span>
                  <small>
                    {summary.available} available · {summary.reserved} reserved
                    · {summary.checkedOut} checked out
                  </small>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
      <div className="filter-bar">
        <Field
          label="Equipment category"
          value={category}
          onChange={setCategory}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Field>
        <Field
          label="Equipment size or model"
          value={size}
          onChange={(value) => {
            setSize(value);
            setPage(1);
          }}
        >
          <option value="">All sizes/models</option>
          {sizes.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </Field>
        <Field
          label="Equipment status"
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {[
            "Available",
            "Reserved",
            "Checked out",
            "Maintenance",
            "Damaged",
            "Lost",
            "Retired",
          ].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </Field>
        <Field
          label="Search by asset code"
          value={query}
          onChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
        />
      </div>
      {actor.role === "manager" && (
        <details className="panel">
          <summary>Bulk-create similar physical assets</summary>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              run(
                (store, currentActor) =>
                  bulkCreateEquipment(store, currentActor, bulk),
                `${bulk.count} individually tracked assets created.`,
              );
            }}
          >
            <div className="form-grid">
              <Field
                label="Category"
                value={bulk.category}
                onChange={(value) => setBulk({ ...bulk, category: value })}
              >
                {Object.keys(equipmentCategories).map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </Field>
              <Field
                label="Size or model group"
                value={bulk.size}
                onChange={(value) => setBulk({ ...bulk, size: value })}
              />
              <Field
                label="Asset code prefix"
                value={bulk.prefix}
                onChange={(value) => setBulk({ ...bulk, prefix: value })}
              />
              <Field
                label="Starting number"
                type="number"
                min={1}
                value={bulk.start}
                onChange={(value) => setBulk({ ...bulk, start: Number(value) })}
              />
              <Field
                label="Number of assets"
                type="number"
                min={1}
                max={100}
                value={bulk.count}
                onChange={(value) => setBulk({ ...bulk, count: Number(value) })}
              />
              <Field
                label="Brand"
                value={bulk.brand}
                onChange={(value) => setBulk({ ...bulk, brand: value })}
              />
              <Field
                label="Model"
                value={bulk.model}
                onChange={(value) => setBulk({ ...bulk, model: value })}
              />
            </div>
            <button>Review and create sequential assets</button>
          </form>
        </details>
      )}
      <details className="panel">
        <summary>Participants & equipment requirements</summary>
        {state.bookings
          .filter(
            (b) =>
              actor &&
              canEquip(state, actor, b.activityId) &&
              !["Cancelled", "Refunded", "No-show", "Completed"].includes(
                b.status,
              ),
          )
          .flatMap((b) =>
            b.participants.map((p) => (
              <p key={p.id}>
                <strong>{p.name}</strong> ·{" "}
                {requestedEquipment(
                  state,
                  state.activities.find((a) => a.id === b.activityId)!,
                  p,
                ).join(", ") || "Own equipment; no rental requested"}{" "}
                ·{" "}
                {
                  state.allocations.filter(
                    (x) => x.participantId === p.id && x.status !== "Returned",
                  ).length
                }{" "}
                active allocations
              </p>
            )),
          )}
      </details>
      {showAssets && (
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
                  {visible.map((i) => (
                    <tr key={i.id}>
                      <td>
                        <strong>{i.category}</strong>
                        <small>{i.id}</small>
                      </td>
                      <td>{i.size}</td>
                      <td>
                        <Badge>{itemOperationalStatus(state, i)}</Badge>
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
            {rows.length > pageSize && (
              <div className="pagination" aria-label="Inventory pages">
                <button
                  className="small secondary"
                  disabled={page === 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {pages} · {rows.length} assets
                </span>
                <button
                  className="small secondary"
                  disabled={page === pages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </section>
          {item && (
            <AssetPanel key={`${item.id}-${item.updatedAt}`} item={item} />
          )}
        </div>
      )}
    </main>
  );
}
