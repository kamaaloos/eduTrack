import {
  FieldValue,
  type Firestore,
} from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { getSchoolAdminAuth, getSchoolAdminDb } from "./firebaseAdmin";
import { assertSchoolAdmin, parseRole, type SchoolUserRole } from "./schoolAdminAuth";

async function commitDeletes(
  db: Firestore,
  docPaths: string[],
): Promise<void> {
  if (docPaths.length === 0) return;

  const BATCH_SIZE = 400;
  for (let i = 0; i < docPaths.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const slice = docPaths.slice(i, i + BATCH_SIZE);
    for (const docPath of slice) {
      batch.delete(db.doc(docPath));
    }
    await batch.commit();
  }
}

async function deleteQueryDocs(
  db: Firestore,
  collectionName: string,
  field: string,
  value: string,
): Promise<void> {
  const snap = await db
    .collection(collectionName)
    .where(field, "==", value)
    .get();
  await commitDeletes(db, snap.docs.map((d) => d.ref.path));
}

async function removeAllParentLinksForStudent(
  db: Firestore,
  studentId: string,
): Promise<void> {
  const parentIds = new Set<string>();
  const deletePaths = new Set<string>();

  const byFieldSnap = await db
    .collection("parentStudents")
    .where("studentId", "==", studentId)
    .get();

  for (const linkDoc of byFieldSnap.docs) {
    deletePaths.add(linkDoc.ref.path);
    const parentId = linkDoc.data().parentId as string | undefined;
    if (parentId) parentIds.add(parentId);
  }

  const suffix = `_${studentId}`;
  const allLinksSnap = await db.collection("parentStudents").get();
  for (const linkDoc of allLinksSnap.docs) {
    if (linkDoc.id.endsWith(suffix)) {
      deletePaths.add(linkDoc.ref.path);
      const parentId = linkDoc.id.slice(0, -suffix.length);
      if (parentId) parentIds.add(parentId);
    } else if (linkDoc.data().studentId === studentId) {
      deletePaths.add(linkDoc.ref.path);
      const parentId = linkDoc.data().parentId as string | undefined;
      if (parentId) parentIds.add(parentId);
    }
  }

  await commitDeletes(db, [...deletePaths]);

  await Promise.all(
    [...parentIds].map((parentId) =>
      db
        .collection("users")
        .doc(parentId)
        .set({ linkedStudentIds: FieldValue.arrayRemove(studentId) }, { merge: true }),
    ),
  );
}

async function removeUserFirestore(
  db: Firestore,
  userId: string,
  role: SchoolUserRole,
): Promise<void> {
  if (role === "student") {
    await removeAllParentLinksForStudent(db, userId);
    await Promise.all([
      deleteQueryDocs(db, "studentClasses", "studentId", userId),
      deleteQueryDocs(db, "attendance", "studentId", userId),
      deleteQueryDocs(db, "grades", "studentId", userId),
      deleteQueryDocs(db, "examResults", "studentId", userId),
    ]);
  } else if (role === "teacher") {
    await Promise.all([
      deleteQueryDocs(db, "teacherClasses", "teacherId", userId),
      deleteQueryDocs(db, "teacherSubjects", "teacherId", userId),
    ]);
  } else if (role === "parent") {
    await Promise.all([
      deleteQueryDocs(db, "parentStudents", "parentId", userId),
      deleteQueryDocs(db, "parentClassAccess", "parentId", userId),
    ]);
  }

  await db.collection("users").doc(userId).delete();
}

async function deleteAuthUser(userId: string): Promise<boolean> {
  try {
    await getSchoolAdminAuth().deleteUser(userId);
    return true;
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: string }).code)
        : "";
    if (code === "auth/user-not-found") {
      return false;
    }
    throw err;
  }
}

/**
 * Callable: school admin removes a user — Firestore profile, links, and Auth account.
 */
export const removeSchoolUser = onCall({ invoker: "public" }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }

  const userId =
    typeof request.data?.userId === "string" ? request.data.userId.trim() : "";
  const requestedRole = parseRole(request.data?.role);

  if (!userId) {
    throw new HttpsError("invalid-argument", "userId is required.");
  }
  if (!requestedRole) {
    throw new HttpsError("invalid-argument", "A valid role is required.");
  }

  if (userId === request.auth.uid) {
    throw new HttpsError("failed-precondition", "You cannot remove your own account.");
  }

  const db = getSchoolAdminDb();
  await assertSchoolAdmin(db, request.auth.uid);

  const targetSnap = await db.collection("users").doc(userId).get();
  if (!targetSnap.exists) {
    throw new HttpsError("not-found", "User profile not found.");
  }

  const profileRole = parseRole(targetSnap.data()?.role);
  if (!profileRole) {
    throw new HttpsError("failed-precondition", "User profile has an invalid role.");
  }

  if (profileRole !== requestedRole) {
    throw new HttpsError(
      "failed-precondition",
      "Role mismatch. Refresh the user list and try again.",
    );
  }

  if (profileRole === "admin") {
    throw new HttpsError(
      "failed-precondition",
      "Removing admin accounts is not supported from the app.",
    );
  }

  await removeUserFirestore(db, userId, profileRole);

  let authDeleted = false;
  try {
    authDeleted = await deleteAuthUser(userId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("removeSchoolUser: auth delete failed", { userId, message });
    throw new HttpsError(
      "internal",
      "Profile removed but Firebase Authentication delete failed. Remove the Auth user manually in Firebase Console.",
    );
  }

  logger.info("removeSchoolUser: complete", {
    userId,
    role: profileRole,
    authDeleted,
    adminUid: request.auth.uid,
  });

  return { ok: true, authDeleted };
});
