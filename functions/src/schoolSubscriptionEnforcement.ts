import { FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import {
  getSchoolFirestore,
  getRegistryDb,
} from "./syncSchoolUserCounts";
import {
  getSchoolSubscriptionBlockReason,
  isSchoolEntitled,
  toSchoolSubscriptionFields,
} from "./schoolSubscriptionAccess";

const SCHOOL_REGISTRY = "schoolRegistry";

export type SubscriptionEnforcementResult = {
  schoolId: string;
  ok: boolean;
  entitled: boolean;
  deactivated?: boolean;
  synced?: boolean;
  error?: string;
};

async function syncSchoolPlatformSubscription(
  projectId: string,
  schoolId: string,
  entitled: boolean,
  fields: ReturnType<typeof toSchoolSubscriptionFields>,
  blockReason: string | null,
): Promise<void> {
  const schoolDb = getSchoolFirestore(projectId);
  await schoolDb.collection("platform").doc("subscription").set(
    {
      entitled,
      schoolId,
      active: fields.active !== false,
      testingExpiresAt: fields.testingExpiresAt ?? null,
      usageExpiresAt: fields.usageExpiresAt ?? null,
      blockReason,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function enforceSchoolSubscription(
  schoolId: string,
  raw: Record<string, unknown>,
): Promise<SubscriptionEnforcementResult> {
  const registryDb = getRegistryDb();
  const docRef = registryDb.collection(SCHOOL_REGISTRY).doc(schoolId);
  const fields = toSchoolSubscriptionFields(raw);
  const entitled = isSchoolEntitled(fields);
  const blockReason = getSchoolSubscriptionBlockReason(fields);
  const projectId =
    typeof raw.firebase === "object" &&
    raw.firebase !== null &&
    "projectId" in raw.firebase
      ? String((raw.firebase as { projectId?: string }).projectId ?? "").trim()
      : "";

  try {
    let deactivated = false;

    if (!entitled && fields.active !== false) {
      await docRef.set(
        {
          active: false,
          subscriptionDeactivatedAt: FieldValue.serverTimestamp(),
          subscriptionBlockReason: blockReason ?? "expired",
        },
        { merge: true },
      );
      deactivated = true;
    }

    if (projectId) {
      await syncSchoolPlatformSubscription(
        projectId,
        schoolId,
        entitled,
        fields,
        blockReason,
      );
    }

    return {
      schoolId,
      ok: true,
      entitled,
      deactivated,
      synced: Boolean(projectId),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn("Subscription enforcement failed", { schoolId, message });
    return { schoolId, ok: false, entitled, error: message };
  }
}

export async function enforceAllSchoolSubscriptions(): Promise<
  SubscriptionEnforcementResult[]
> {
  const registryDb = getRegistryDb();
  const snapshot = await registryDb.collection(SCHOOL_REGISTRY).get();
  const results: SubscriptionEnforcementResult[] = [];

  for (const doc of snapshot.docs) {
    results.push(
      await enforceSchoolSubscription(doc.id, doc.data() as Record<string, unknown>),
    );
  }

  return results;
}

/** Re-sync entitlement after super-admin extends dates or reactivates a school. */
export async function refreshSchoolSubscription(
  schoolId: string,
): Promise<SubscriptionEnforcementResult> {
  const registryDb = getRegistryDb();
  const doc = await registryDb.collection(SCHOOL_REGISTRY).doc(schoolId).get();
  if (!doc.exists) {
    return {
      schoolId,
      ok: false,
      entitled: false,
      error: "not_found",
    };
  }

  const data = doc.data() as Record<string, unknown>;
  const fields = toSchoolSubscriptionFields(data);
  const entitled = isSchoolEntitled(fields);
  const blockReason = getSchoolSubscriptionBlockReason(fields);
  const projectId =
    typeof data.firebase === "object" &&
    data.firebase !== null &&
    "projectId" in data.firebase
      ? String((data.firebase as { projectId?: string }).projectId ?? "").trim()
      : "";

  if (!projectId) {
    return {
      schoolId,
      ok: false,
      entitled,
      error: "missing_project_id",
    };
  }

  try {
    await syncSchoolPlatformSubscription(
      projectId,
      schoolId,
      entitled,
      fields,
      blockReason,
    );
    return { schoolId, ok: true, entitled, synced: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { schoolId, ok: false, entitled, error: message };
  }
}
