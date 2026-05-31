import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

const REGISTRY_APP_NAME = "EduTrackRegistry";

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

function getRegistryFunctions() {
  return getFunctions(getApp(REGISTRY_APP_NAME));
}

/** Triggers registry Cloud Function to sync billable user counts from school Firebase projects. */
export async function refreshSchoolUserCounts(
  schoolId?: string,
): Promise<RefreshUserCountsResult> {
  const callable = httpsCallable<{ schoolId?: string }, RefreshUserCountsResult>(
    getRegistryFunctions(),
    "refreshSchoolUserCounts",
  );
  const response = await callable(schoolId ? { schoolId } : {});
  return response.data;
}
