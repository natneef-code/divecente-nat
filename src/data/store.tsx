import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  actorFor,
  roles,
  type Actor,
  type Role,
  type Store,
} from "../domain/model";
import { seed } from "../domain/seed";
import { migrateStore } from "../domain/records";
export const STORAGE_KEY = "diveos-demo-v1";
function load(): Store {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed();
  const s = JSON.parse(raw);
  if (
    s.version !== 1 ||
    ![
      "courses",
      "activities",
      "customers",
      "bookings",
      "payments",
      "events",
    ].every((k) => Array.isArray(s[k]))
  )
    throw new Error(
      "Saved demo data is incompatible. Reset the fictional demo to continue.",
    );
  return migrateStore(s);
}
const Context = createContext<null | {
  state: Store;
  actor: Actor | null;
  login: (r: Role) => void;
  logout: () => void;
  update: <T>(fn: (s: Store, a: Actor) => { state: Store; result: T }) => T;
}>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [fault, setFault] = useState("");
  const [state, setState] = useState<Store>(() => {
    try {
      return load();
    } catch (e) {
      setTimeout(() => setFault(String(e)), 0);
      return seed();
    }
  });
  const ref = useRef(state);
  const [actor, setActor] = useState<Actor | null>(() => {
    try {
      const r = sessionStorage.getItem("diveos-role");
      return roles.some((x) => x.id === r) ? actorFor(r as Role) : null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    function sync(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        try {
          const next = load();
          ref.current = next;
          setState(next);
        } catch (e) {
          setFault(String(e));
        }
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function update<T>(
    fn: (s: Store, a: Actor) => { state: Store; result: T },
  ): T {
    if (!actor) throw new Error("Select a demo role to continue.");
    const latest = localStorage.getItem(STORAGE_KEY) ? load() : ref.current;
    const next = fn(latest, actor);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.state));
    } catch {
      throw new Error(
        "Demo could not be saved. Browser storage may be full or disabled. No change was applied.",
      );
    }
    ref.current = next.state;
    setState(next.state);
    return next.result;
  }
  if (fault)
    return (
      <main className="container section">
        <h1>Saved demo needs attention</h1>
        <p role="alert">{fault}</p>
        <p>Reset removes only fictional DiveOS records from this browser.</p>
        <button
          onClick={() => {
            if (
              confirm("Delete this browser’s fictional DiveOS demo records?")
            ) {
              try {
                localStorage.removeItem(STORAGE_KEY);
                location.reload();
              } catch {
                setFault(
                  "Browser storage is unavailable. Enable site storage and reload.",
                );
              }
            }
          }}
        >
          Reset fictional demo
        </button>
      </main>
    );
  return (
    <Context.Provider
      value={{
        state,
        actor,
        update,
        login: (r) => {
          sessionStorage.setItem("diveos-role", r);
          setActor(actorFor(r));
        },
        logout: () => {
          sessionStorage.removeItem("diveos-role");
          setActor(null);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const context = useContext(Context);
  if (!context) throw new Error("Store is missing.");
  return context;
}
