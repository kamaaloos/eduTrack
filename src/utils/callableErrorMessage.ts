import { FirebaseError } from "firebase/app";

const GENERIC_CALLABLE_MESSAGES = new Set([
  "internal",
  "INTERNAL",
  "unknown",
  "UNKNOWN",
]);

function isGenericCallableMessage(message: string): boolean {
  return GENERIC_CALLABLE_MESSAGES.has(message.trim());
}

/**
 * User-facing text from a Firebase callable error.
 * Internal errors hide server messages — use fallback instead.
 */
export function getCallableErrorMessage(
  err: unknown,
  fallback: string,
): string {
  if (err instanceof FirebaseError) {
    if (err.code === "functions/internal") {
      return fallback;
    }
    const message = err.message?.trim();
    if (message && !isGenericCallableMessage(message)) {
      return message;
    }
    if (err.code === "functions/unauthenticated") {
      return "Sign in required. Please sign in again.";
    }
    if (err.code === "functions/permission-denied") {
      return "You do not have permission to perform this action.";
    }
    if (err.code === "functions/not-found") {
      return "This action is not available for your school yet.";
    }
    if (err.code === "functions/unavailable") {
      return "Service temporarily unavailable. Try again shortly.";
    }
  }
  if (err instanceof Error) {
    const message = err.message.trim();
    if (message && !isGenericCallableMessage(message)) {
      return message;
    }
  }
  return fallback;
}
