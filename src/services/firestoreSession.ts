type ListenerCleanup = () => void;

const closingListeners = new Set<ListenerCleanup>();

/** Register a callback that runs synchronously before Firestore is terminated. */
export function onFirestoreClosing(cleanup: ListenerCleanup): ListenerCleanup {
  closingListeners.add(cleanup);
  return () => {
    closingListeners.delete(cleanup);
  };
}

export function notifyFirestoreClosing() {
  for (const cleanup of closingListeners) {
    try {
      cleanup();
    } catch {
      // Ignore cleanup errors during shutdown.
    }
  }
}

export function isIgnorableFirestoreListenerError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;

  const message = String((err as Error).message ?? "");
  const code = String((err as { code?: string }).code ?? "");

  return (
    message.includes("permission") ||
    message.includes("shutting down") ||
    code === "cancelled" ||
    code === "aborted"
  );
}
