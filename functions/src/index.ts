import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import {
  enforceAllSchoolSubscriptions,
  refreshSchoolSubscription,
} from "./schoolSubscriptionEnforcement";
import {
  assertRegistrySuperAdmin,
  getRegistryDb,
  syncAllSchoolUserCounts,
  syncSchoolUserCount,
} from "./syncSchoolUserCounts";

/** Daily: deactivate expired schools in registry + sync platform/subscription docs. */
export const enforceSchoolSubscriptionsScheduled = onSchedule(
  {
    schedule: "every day 03:00",
    timeZone: "UTC",
  },
  async () => {
    const results = await enforceAllSchoolSubscriptions();
    const failed = results.filter((item) => !item.ok);
    const deactivated = results.filter((item) => item.deactivated);
    logger.info("Subscription enforcement finished", {
      total: results.length,
      failed: failed.length,
      deactivated: deactivated.length,
    });
    if (failed.length > 0) {
      logger.warn("Some schools failed subscription enforcement", { failed });
    }
  },
);

/** Callable: super-admin refreshes subscription sync for one or all schools. */
export const refreshSchoolSubscriptions = onCall(
  { invoker: "public" },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }

    try {
      await assertRegistrySuperAdmin(request.auth.uid);
    } catch {
      throw new HttpsError("permission-denied", "Super admin required.");
    }

    const schoolId =
      typeof request.data?.schoolId === "string"
        ? request.data.schoolId.trim()
        : undefined;

    if (schoolId) {
      const doc = await getRegistryDb()
        .collection("schoolRegistry")
        .doc(schoolId)
        .get();
      if (!doc.exists) {
        throw new HttpsError("not-found", "School not found.");
      }
      return refreshSchoolSubscription(schoolId);
    }

    return enforceAllSchoolSubscriptions();
  },
);

/** Nightly sync of billable user counts into schoolRegistry (registry project). */
export const syncSchoolUserCountsScheduled = onSchedule(
  {
    schedule: "every day 03:00",
    timeZone: "UTC",
  },
  async () => {
    const results = await syncAllSchoolUserCounts();
    const failed = results.filter((item) => !item.ok);
    logger.info("Scheduled user count sync finished", {
      total: results.length,
      failed: failed.length,
    });
    if (failed.length > 0) {
      logger.warn("Some schools failed user count sync", { failed });
    }
  },
);

/** Callable: super-admin refreshes one school or all schools. */
export const refreshSchoolUserCounts = onCall(
  { invoker: "public" },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }

    try {
      await assertRegistrySuperAdmin(request.auth.uid);
    } catch {
      throw new HttpsError("permission-denied", "Super admin required.");
    }

    const schoolId =
      typeof request.data?.schoolId === "string"
        ? request.data.schoolId.trim()
        : undefined;

    if (schoolId) {
      const doc = await getRegistryDb()
        .collection("schoolRegistry")
        .doc(schoolId)
        .get();
      if (!doc.exists) {
        throw new HttpsError("not-found", "School not found.");
      }
      return syncSchoolUserCount(schoolId, doc.data() ?? {});
    }

    const results = await syncAllSchoolUserCounts();
    return {
      total: results.length,
      synced: results.filter((item) => item.ok).length,
      failed: results.filter((item) => !item.ok).length,
      results,
    };
  },
);
