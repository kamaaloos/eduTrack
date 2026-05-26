import { useEffect } from "react";
import { onFirestoreClosing } from "../src/services/firestoreSession";

type Unsubscribe = () => void;

function collectUnsubs(result: Unsubscribe | Unsubscribe[] | void): Unsubscribe[] {
  if (typeof result === "function") return [result];
  if (Array.isArray(result)) return result;
  return [];
}

/** Runs a Firestore listener effect and unsubs before Firestore terminate on logout. */
export function useFirestoreListenerEffect(
  effect: () => Unsubscribe | Unsubscribe[] | void,
  deps: React.DependencyList,
) {
  useEffect(() => {
    const unsubs = collectUnsubs(effect());

    const stopAll = () => {
      while (unsubs.length > 0) {
        try {
          unsubs.pop()?.();
        } catch {
          // Listener may already be removed during Firestore shutdown.
        }
      }
    };

    const removeClosingHandler = onFirestoreClosing(stopAll);

    return () => {
      removeClosingHandler();
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, deps);
}
