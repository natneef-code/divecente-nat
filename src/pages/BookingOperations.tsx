import { useStore } from "../data/store";
import { type Booking, money } from "../domain/model";
import { paid, balance } from "../domain/commands";
import {
  reviewDocuments,
  manualPayment,
  cancelBooking,
  refundBooking,
} from "../domain/operations";
import { useAction } from "./operation-ui";
import { legal } from "./Booking";
import { Badge } from "../ui";
export function BookingOperations({ booking: b }: { booking: Booking }) {
  const { state, actor } = useStore();
  const { run, feedback } = useAction();
  const documents = state.documents.filter((d) => d.bookingId === b.id);
  const refundable =
    paid(state, b.id) -
    state.refunds
      .filter((r) => r.bookingId === b.id)
      .reduce((n, r) => n + r.amount, 0);
  return (
    <div className="booking-operations">
      {feedback}
      <details>
        <summary>Document review & booking actions</summary>
        <p className="legal">{legal}</p>
        <div className="document-records">
          {documents.map((d) => (
            <div key={d.id}>
              <span>
                {b.participants.find((p) => p.id === d.participantId)?.name} ·{" "}
                {d.type}
                <small>
                  {d.version} ·{" "}
                  {d.reviewedAt
                    ? `Reviewed ${d.reviewedAt.slice(0, 10)}`
                    : "Awaiting review"}
                </small>
              </span>
              <Badge>{d.status}</Badge>
            </div>
          ))}
        </div>
        {!["Cancelled", "Refunded"].includes(b.status) && (
          <div className="actions">
            <button
              className="small"
              onClick={() =>
                run(
                  (s, a) => reviewDocuments(s, a, b.id, true),
                  "Demo documents reviewed; operational status cleared.",
                )
              }
            >
              Approve demo documents
            </button>
            <button
              className="small secondary"
              onClick={() =>
                run(
                  (s, a) => reviewDocuments(s, a, b.id, false),
                  "Documents flagged for review.",
                )
              }
            >
              Flag document review
            </button>
          </div>
        )}
        <div className="actions">
          {b.status === "Awaiting payment" && (
            <button
              className="small secondary"
              onClick={() =>
                run(
                  (s, a) => manualPayment(s, a, b.id, b.deposit),
                  "Simulated manual deposit recorded.",
                )
              }
            >
              Record demo deposit · {money(b.deposit)}
            </button>
          )}
          {[
            "Deposit paid",
            "Confirmed",
            "Checked in",
            "In progress",
            "Completed",
          ].includes(b.status) &&
            balance(state, b) > 0 && (
              <button
                className="small secondary"
                onClick={() =>
                  run(
                    (s, a) => manualPayment(s, a, b.id, balance(s, b)),
                    "Simulated remaining balance recorded.",
                  )
                }
              >
                Record demo balance · {money(balance(state, b))}
              </button>
            )}
          {!["Completed", "Cancelled", "Refunded"].includes(b.status) && (
            <button
              className="small danger"
              onClick={() => {
                if (
                  confirm(
                    "Cancel this fictional booking and release its reserved capacity/equipment?",
                  )
                )
                  run(
                    (s, a) => cancelBooking(s, a, b.id),
                    "Booking cancelled.",
                  );
              }}
            >
              Cancel booking
            </button>
          )}
          {actor?.role === "manager" &&
            ["Cancelled", "Refunded"].includes(b.status) &&
            refundable > 0 && (
              <button
                className="small secondary"
                onClick={() => {
                  if (
                    confirm(
                      `Record a simulated refund of ${money(refundable)}? No money will move.`,
                    )
                  )
                    run(
                      (s, a) =>
                        refundBooking(
                          s,
                          a,
                          b.id,
                          refundable,
                          "Fictional cancellation refund",
                        ),
                      "Demo refund recorded.",
                    );
                }}
              >
                Refund demo payments · {money(refundable)}
              </button>
            )}
        </div>
        {state.refunds
          .filter((r) => r.bookingId === b.id)
          .map((r) => (
            <p className="muted" key={r.id}>
              Simulated refund {money(r.amount)} · {r.reason}
            </p>
          ))}
      </details>
    </div>
  );
}
