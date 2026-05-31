import { getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const SCHOOL_REGISTRY = "schoolRegistry";

export type SchoolRegistryFirebase = {
  projectId?: string;
};

export type SchoolRegistryRow = {
  firebase?: SchoolRegistryFirebase;
};

export type SyncSchoolResult = {
  schoolId: string;
  ok: boolean;
  userCount?: number;
  error?: string;
};

function ensureAdminApp() {
  if (getApps().length === 0) {
    initializeApp();
  }
}

function getRegistryDb() {
  ensureAdminApp();
  return getFirestore();
}

function getSchoolFirestore(projectId: string) {
  const appName = `edutrack-school-${projectId}`;
  const existing = getApps().find((app) => app.name === appName);
  const app =
    existing ??
    initializeApp(
      {
        projectId,
      },
      appName,
    );
  return getFirestore(app);
}

async function countUsersInProject(projectId: string): Promise<number> {
  const schoolDb = getSchoolFirestore(projectId);
  const snapshot = await schoolDb.collection("users").count().get();
  return snapshot.data().count;
}

export async function syncSchoolUserCount(
  schoolId: string,
  data: SchoolRegistryRow,
): Promise<SyncSchoolResult> {
  const projectId = data.firebase?.projectId?.trim();
  const registryDb = getRegistryDb();
  const docRef = registryDb.collection(SCHOOL_REGISTRY).doc(schoolId);

  if (!projectId) {
    const error = "missing_project_id";
    await docRef.set(
      {
        userCountSyncError: error,
        userCountUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return { schoolId, ok: false, error };
  }

  try {
    const userCount = await countUsersInProject(projectId);
    await docRef.set(
      {
        userCount,
        userCountUpdatedAt: FieldValue.serverTimestamp(),
        userCountSyncError: null,
      },
      { merge: true },
    );
    return { schoolId, ok: true, userCount };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await docRef.set(
      {
        userCountSyncError: message.slice(0, 500),
        userCountUpdatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return { schoolId, ok: false, error: message };
  }
}

export async function syncAllSchoolUserCounts(): Promise<SyncSchoolResult[]> {
  const registryDb = getRegistryDb();
  const snapshot = await registryDb.collection(SCHOOL_REGISTRY).get();
  const results: SyncSchoolResult[] = [];

  for (const doc of snapshot.docs) {
    results.push(await syncSchoolUserCount(doc.id, doc.data() as SchoolRegistryRow));
  }

  return results;
}

export async function assertRegistrySuperAdmin(uid: string): Promise<void> {
  const registryDb = getRegistryDb();
  const profile = await registryDb.collection("users").doc(uid).get();
  if (!profile.exists || profile.data()?.role !== "superAdmin") {
    throw new Error("permission_denied");
  }
}

export { getRegistryDb };
