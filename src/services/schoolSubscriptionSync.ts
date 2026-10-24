import { FirebaseError } from "firebase/app";
import { httpsCallable } from "firebase/functions";
import { getRegistryFirebaseApp, registryAuth } from "./firebase";
import { getRegistryFunctions } from "./registryFunctions";

export type RefreshSubscriptionResult = {
  schoolId: string;
  ok: boolean;
  entitled: boolean;
  synced?: boolean;
  deactivated?: boolean;
  error?: string;
};

function superAdminRequiredHint(): string {
  const uid = registryAuth?.currentUser?.uid ?? "your-uid";
  const projectId =
    registryAuth?.app.options.projectId ??
    getRegistryFirebaseApp()?.options.projectId ??
    "registry-project";
  return (
    `Super admin required to refresh school subscription. ` +
    `In Firebase project "${projectId}", ensure Firestore users/${uid} has role = "superAdmin" ` +
    `(document id must match your Auth UID). Then sign out and sign in again. ` +
    `If that is already correct: Cloud Run → refreshschoolsubscriptions → Allow unauthenticated invoke.`
  );
}

function parseCallableError(err: unknown): Error {
  if (err instanceof FirebaseError) {
    if (err.code === "functions/permission-denied") {
      // Prefer server detail (role mismatch / missing profile) when present.
      const serverMessage = err.message?.replace(/^Firebase:\s*/i, "").trim();
      if (
        serverMessage &&
        (serverMessage.includes("users/") ||
          serverMessage.includes("role mismatch") ||
          serverMessage.includes("profile missing"))
      ) {
        return new Error(serverMessage);
      }
      return new Error(superAdminRequiredHint());
    }
    if (err.code === "functions/unauthenticated") {
      return new Error("Sign in required. Open Platform admin and sign in again.");
    }
    if (err.message) {
      return new Error(err.message);
    }
  }
  if (err instanceof Error) {
    return err;
  }
  return new Error("Subscription sync failed");
}

/** Syncs registry entitlement into the school project's platform/subscription doc. */
export async function refreshSchoolSubscriptionSync(
  schoolId: string,
): Promise<RefreshSubscriptionResult> {
  if (!registryAuth?.currentUser) {
    throw new Error("Sign in required. Open Platform admin and sign in again.");
  }

  const functions = getRegistryFunctions();
  if (!functions) {
    throw new Error("Firebase registry is not configured.");
  }

  try {
    // Ensure the callable gets a fresh registry ID token (stale tokens can look like permission-denied).
    await registryAuth.currentUser.getIdToken(true);
    const callable = httpsCallable<{ schoolId: string }, RefreshSubscriptionResult>(
      functions,
      "refreshSchoolSubscriptions",
    );
    const response = await callable({ schoolId });
    return response.data;
  } catch (err) {
    throw parseCallableError(err);
  }
}
