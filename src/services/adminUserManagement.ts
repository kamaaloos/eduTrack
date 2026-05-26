import { sendPasswordResetEmail } from "firebase/auth";
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
import { auth, db } from "./firebase";
import type { UserRole } from "../../hooks/useAdminUsers";

export async function updateUserProfile(
  userId: string,
  updates: { name?: string; email?: string },
): Promise<void> {
  const payload: Record<string, string> = {};
  if (updates.name?.trim()) payload.name = updates.name.trim();
  if (updates.email?.trim()) payload.email = updates.email.trim().toLowerCase();
  if (Object.keys(payload).length === 0) {
    throw new Error("Nothing to update");
  }
  await setDoc(doc(db, "users", userId), payload, { merge: true });
}

export async function sendUserPasswordReset(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error("Email is required");
  await sendPasswordResetEmail(auth, normalized);
}

async function deleteQueryDocs(
  collectionName: string,
  field: string,
  value: string,
): Promise<void> {
  const snap = await getDocs(
    query(collection(db, collectionName), where(field, "==", value)),
  );
  if (snap.empty) return;

  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

/** Removes Firestore profile and role-related links. Firebase Auth account may remain. */
export async function removeUserAndLinks(
  userId: string,
  role: UserRole,
): Promise<void> {
  if (role === "student") {
    await Promise.all([
      deleteQueryDocs("studentClasses", "studentId", userId),
      deleteQueryDocs("parentStudents", "studentId", userId),
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

  await deleteDoc(doc(db, "users", userId));
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
  await setDoc(doc(db, "classes", classId), payload, { merge: true });
}

export async function removeClass(classId: string): Promise<void> {
  await Promise.all([
    deleteQueryDocs("studentClasses", "classId", classId),
    deleteQueryDocs("teacherClasses", "classId", classId),
    deleteQueryDocs("teacherSubjects", "classId", classId),
  ]);
  await deleteDoc(doc(db, "classes", classId));
}
