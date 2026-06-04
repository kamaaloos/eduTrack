import { sendPasswordResetEmail } from "firebase/auth";
import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { requireSchoolAuth, requireSchoolDb } from "./firebase";
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

export async function sendUserPasswordReset(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error("Email is required");
  await sendPasswordResetEmail(requireSchoolAuth(), normalized);
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

/** Removes Firestore profile and role-related links. Firebase Auth account may remain. */
export async function removeUserAndLinks(
  userId: string,
  role: UserRole,
): Promise<void> {
  if (role === "student") {
    const schoolDb = requireSchoolDb();
    const parentLinkSnap = await getDocs(
      query(
        collection(schoolDb, "parentStudents"),
        where("studentId", "==", userId),
      ),
    );
    const parentIds = new Set<string>();
    for (const linkDoc of parentLinkSnap.docs) {
      const parentId = linkDoc.data().parentId as string | undefined;
      if (parentId) parentIds.add(parentId);
    }

    await Promise.all([
      deleteQueryDocs("studentClasses", "studentId", userId),
      deleteQueryDocs("parentStudents", "studentId", userId),
      deleteQueryDocs("attendance", "studentId", userId),
      deleteQueryDocs("grades", "studentId", userId),
      deleteQueryDocs("examResults", "studentId", userId),
      ...[...parentIds].map((parentId) =>
        setDoc(
          doc(schoolDb, "users", parentId),
          { linkedStudentIds: arrayRemove(userId) },
          { merge: true },
        ),
      ),
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
