import { FirebaseError } from "firebase/app";
import { httpsCallable } from "firebase/functions";
import { registryAuth } from "./firebase";
import { getRegistryFunctions } from "./registryFunctions";

export type RefreshSubscriptionResult = {
  schoolId: string;
  ok: boolean;
  entitled: boolean;
  synced?: boolean;
  deactivated?: boolean;
  error?: string;
};

function parseCallableError(err: unknown): Error {
  if (err instanceof FirebaseError) {
    if (err.code === "functions/permission-denied") {
      return new Error("Super admin required to refresh school subscription.");
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
