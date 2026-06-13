import { FirebaseError } from "firebase/app";
import { httpsCallable } from "firebase/functions";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { requireSchoolDb } from "./firebase";
import { removeAllParentLinksForStudent } from "./parentStudentLinks";
import { getSchoolFunctions } from "./schoolFunctions";
import type { UserRole } from "../../hooks/useAdminUsers";

export async function updateUserProfile(
  userId: string,
  updates: { name?: string; email?: string; phone?: string; feePaid?: boolean },
): Promise<void> {
  const payload: Record<string, string | boolean> = {};
  if (updates.name?.trim()) payload.name = updates.name.trim();
  if (updates.email?.trim()) payload.email = updates.email.trim().toLowerCase();
  if (updates.phone !== undefined) payload.phone = updates.phone.trim();
  if (updates.feePaid !== undefined) payload.feePaid = updates.feePaid;
  if (Object.keys(payload).length === 0) {
    throw new Error("Nothing to update");
  }
  await setDoc(doc(requireSchoolDb(), "users", userId), payload, { merge: true });
}

export async function setUserPassword(
  userId: string,
  newPassword: string,
): Promise<void> {
  const trimmed = newPassword.trim();
  if (trimmed.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const functions = getSchoolFunctions();
  if (!functions) {
    throw new FirebaseError("functions/not-found", "School functions not configured.");
  }

  const callable = httpsCallable<
    { userId: string; newPassword: string },
    { ok: boolean }
  >(functions, "setSchoolUserPassword");

  await callable({ userId, newPassword: trimmed });
}

async function deleteQueryDocs(
  collectionName: string,
  field: string,
  value: string,
): Promise<void> {
  const schoolDb = requireSchoolDb();
  const snap = await getDocs(
    query(collection(schoolDb, collectionName), where(field, "==", value)),
  );
  if (snap.empty) return;

  const batch = writeBatch(schoolDb);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

function isCallableUnavailable(err: unknown): boolean {
  if (err instanceof FirebaseError) {
    return (
      err.code === "functions/not-found" ||
      err.code === "functions/unavailable"
    );
  }
  return false;
}

async function callRemoveSchoolUser(
  userId: string,
  role: UserRole,
): Promise<{ authDeleted: boolean }> {
  const functions = getSchoolFunctions();
  if (!functions) {
    throw new FirebaseError("functions/not-found", "School functions not configured.");
  }

  const callable = httpsCallable<
    { userId: string; role: UserRole },
    { ok: boolean; authDeleted: boolean }
  >(functions, "removeSchoolUser");

  const response = await callable({ userId, role });
  return { authDeleted: response.data.authDeleted };
}

/** Client fallback when school Cloud Function is not deployed. */
async function removeUserAndLinksClient(
  userId: string,
  role: UserRole,
): Promise<void> {
  if (role === "student") {
    await removeAllParentLinksForStudent(userId);
    await Promise.all([
      deleteQueryDocs("studentClasses", "studentId", userId),
      deleteQueryDocs("attendance", "studentId", userId),
      deleteQueryDocs("grades", "studentId", userId),
      deleteQueryDocs("examResults", "studentId", userId),
    ]);
  } else if (role === "teacher") {
    await Promise.all([
      deleteQueryDocs("teacherClasses", "teacherId", userId),
      deleteQueryDocs("teacherSubjects", "teacherId", userId),
    ]);
  } else if (role === "parent") {
    await Promise.all([
      deleteQueryDocs("parentStudents", "parentId", userId),
      deleteQueryDocs("parentClassAccess", "parentId", userId),
    ]);
  }

  await deleteDoc(doc(requireSchoolDb(), "users", userId));
}

/**
 * Removes Firestore profile, role links, and Firebase Auth (via school Cloud Function).
 * Falls back to client-only cleanup if the function is not deployed.
 */
export async function removeUserAndLinks(
  userId: string,
  role: UserRole,
): Promise<{ authDeleted: boolean }> {
  try {
    return await callRemoveSchoolUser(userId, role);
  } catch (err) {
    if (!isCallableUnavailable(err)) {
      throw err instanceof Error ? err : new Error("Failed to remove user");
    }
    console.warn(
      "removeSchoolUser Cloud Function unavailable; using client-only removal (Auth account may remain).",
      err,
    );
    await removeUserAndLinksClient(userId, role);
    return { authDeleted: false };
  }
}

export async function updateClassRecord(
  classId: string,
  updates: { name?: string },
): Promise<void> {
  const payload: Record<string, string> = {};
  if (updates.name?.trim()) payload.name = updates.name.trim();
  if (Object.keys(payload).length === 0) {
    throw new Error("Nothing to update");
  }
  await setDoc(doc(requireSchoolDb(), "classes", classId), payload, { merge: true });
}

export async function removeClass(classId: string): Promise<void> {
  await Promise.all([
    deleteQueryDocs("studentClasses", "classId", classId),
    deleteQueryDocs("teacherClasses", "classId", classId),
    deleteQueryDocs("teacherSubjects", "classId", classId),
  ]);
  await deleteDoc(doc(requireSchoolDb(), "classes", classId));
}
