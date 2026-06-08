import { FirebaseError } from "firebase/app";
import { httpsCallable } from "firebase/functions";
import { getRegistryFirebaseApp, registryAuth } from "./firebase";
import { getRegistryFunctions } from "./registryFunctions";

export type RefreshUserCountsResult =
  | {
      schoolId: string;
      ok: boolean;
      userCount?: number;
      error?: string;
    }
  | {
      total: number;
      synced: number;
      failed: number;
    };

function superAdminProfileHint(uid: string, projectId: string): string {
  return (
    `Super admin required. In Firebase project "${projectId}", create or fix ` +
    `Firestore document users/${uid} with field role = "superAdmin". ` +
    `The document ID must match your Authentication UID exactly (not your email).`
  );
}

function parseCallableError(err: unknown): Error {
  if (err instanceof FirebaseError) {
    if (err.code === "functions/permission-denied") {
      const uid = registryAuth?.currentUser?.uid ?? "your-uid";
      const projectId =
        registryAuth?.app.options.projectId ??
        getRegistryFirebaseApp()?.options.projectId ??
        "registry-project";
      return new Error(superAdminProfileHint(uid, projectId));
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
  return new Error("Sync failed");
}

/** Triggers registry Cloud Function to sync billable user counts from school Firebase projects. */
export async function refreshSchoolUserCounts(
  schoolId?: string,
): Promise<RefreshUserCountsResult> {
  if (!registryAuth?.currentUser) {
    throw new Error("Sign in required. Open Platform admin and sign in again.");
  }

  const functions = getRegistryFunctions();
  if (!functions) {
    throw new Error("Firebase registry is not configured.");
  }

  try {
    const callable = httpsCallable<
      { schoolId?: string },
      RefreshUserCountsResult
    >(functions, "refreshSchoolUserCounts");
    const response = await callable(schoolId ? { schoolId } : {});
    return response.data;
  } catch (err) {
    throw parseCallableError(err);
  }
}
