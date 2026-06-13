import { FirebaseError } from "firebase/app";
import { httpsCallable } from "firebase/functions";
import { getSchoolFunctions } from "./schoolFunctions";

function isCallableUnavailable(err: unknown): boolean {
  if (err instanceof FirebaseError) {
    return (
      err.code === "functions/not-found" ||
      err.code === "functions/unavailable"
    );
  }
  return false;
}

/** Login screen: notify school admins (no email reset link). */
export async function requestSchoolPasswordResetHelp(
  email: string,
): Promise<void> {
  const functions = getSchoolFunctions();
  if (!functions) {
    throw new Error("School connection is not ready.");
  }

  const callable = httpsCallable<{ email: string }, { ok: boolean }>(
    functions,
    "requestSchoolPasswordReset",
  );

  try {
    await callable({ email: email.trim().toLowerCase() });
  } catch (err) {
    if (isCallableUnavailable(err)) {
      throw new Error(
        "Password reset requests are not available yet. Contact your school administrator directly.",
      );
    }
    throw err instanceof Error ? err : new Error("Request failed");
  }
}
