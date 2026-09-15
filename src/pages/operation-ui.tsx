import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../data/store";
import type { Actor, Store } from "../domain/model";
export function useAction() {
  const { update } = useStore();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  function run(fn: (s: Store, a: Actor) => Store, message = "Changes saved.") {
    setError("");
    setSuccess("");
    try {
      const next = update((s, a) => {
        const state = fn(s, a);
        return { state, result: state };
      });
      setSuccess(message);
      return next;
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }
  return {
    run,
    feedback: (
      <>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="success" role="status">
            {success}
          </p>
        )}
      </>
    ),
  };
}
export function Denied() {
  return (
    <main className="container section">
      <h1>Permission denied</h1>
      <p>This operation is not available to your demo role.</p>
      <Link className="button" to="/demo">
        Switch demo role
      </Link>
    </main>
  );
}
export function Field({
  label,
  value,
  onChange,
  type = "text",
  children,
  required = false,
  min,
  max,
  step,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  children?: ReactNode;
  required?: boolean;
  min?: number;
  max?: number;
  step?: string;
}) {
  return (
    <label>
      {label}
      {children ? (
        <select
          aria-label={label}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        >
          {children}
        </select>
      ) : type === "textarea" ? (
        <textarea
          aria-label={label}
          value={value}
          required={required}
          rows={3}
          maxLength={2000}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          aria-label={label}
          value={value}
          type={type}
          required={required}
          min={min}
          max={max}
          step={step}
          maxLength={type === "text" ? 120 : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
