import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type DocumentReference,
} from "firebase/firestore";
import { db, requireSchoolDb } from "./firebase";
import { syncParentClassAccess } from "./parentClassAccess";

export function parentStudentLinkId(parentId: string, studentId: string): string {
  return `${parentId}_${studentId}`;
}

/** Admin: normalize parentStudents docs and parent profile linkedStudentIds. */
export async function reconcileParentStudentLinks(): Promise<void> {
  const schoolDb = requireSchoolDb();
  const snap = await getDocs(collection(schoolDb, "parentStudents"));
  const byParent = new Map<string, Set<string>>();

  for (const linkDoc of snap.docs) {
    const data = linkDoc.data();
    let parentId = data.parentId as string | undefined;
    let studentId = data.studentId as string | undefined;

    // Legacy doc keyed only by parent uid (no parentId field)
    if (!parentId && studentId && linkDoc.id.length > 0) {
      parentId = linkDoc.id;
    }

    if (!parentId || !studentId) continue;

    const expectedId = parentStudentLinkId(parentId, studentId);
    if (linkDoc.id !== expectedId) {
      await setDoc(
        doc(schoolDb, "parentStudents", expectedId),
        {
          parentId,
          studentId,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      if (linkDoc.id !== expectedId) {
        await deleteDoc(linkDoc.ref);
      }
    }

    if (!byParent.has(parentId)) {
      byParent.set(parentId, new Set());
    }
    byParent.get(parentId)!.add(studentId);
  }

  await Promise.all(
    [...byParent.entries()].map(([parentId, studentIds]) =>
      setDoc(
        doc(schoolDb, "users", parentId),
        { linkedStudentIds: [...studentIds] },
        { merge: true },
      ),
    ),
  );
}

/** Creates/updates the canonical link and keeps parent profile in sync. */
export async function upsertParentStudentLink(
  parentId: string,
  studentId: string,
): Promise<void> {
  const schoolDb = requireSchoolDb();
  const linkId = parentStudentLinkId(parentId, studentId);

  await setDoc(
    doc(schoolDb, "parentStudents", linkId),
    {
      parentId,
      studentId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await setDoc(
    doc(schoolDb, "users", parentId),
    { linkedStudentIds: arrayUnion(studentId) },
    { merge: true },
  );

  const legacyRef = doc(schoolDb, "parentStudents", parentId);
  const legacySnap = await getDoc(legacyRef);
  if (legacySnap.exists()) {
    const legacyStudentId = legacySnap.data()?.studentId as string | undefined;
    if (legacyStudentId && legacyStudentId !== studentId) {
      await setDoc(
        doc(schoolDb, "parentStudents", parentStudentLinkId(parentId, legacyStudentId)),
        {
          parentId,
          studentId: legacyStudentId,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      await setDoc(
        doc(schoolDb, "users", parentId),
        { linkedStudentIds: arrayUnion(legacyStudentId) },
        { merge: true },
      );
      await syncParentClassAccess(parentId, legacyStudentId);
    }
    if (legacySnap.id === parentId) {
      await deleteDoc(legacyRef);
    }
  }

  await syncParentClassAccess(parentId, studentId);
}

/** Removes all parentStudents docs and linkedStudentIds entries for a student. */
export async function removeAllParentLinksForStudent(
  studentId: string,
): Promise<void> {
  const schoolDb = requireSchoolDb();
  const parentIds = new Set<string>();
  const deleteRefs = new Map<string, DocumentReference>();

  const byFieldSnap = await getDocs(
    query(
      collection(schoolDb, "parentStudents"),
      where("studentId", "==", studentId),
    ),
  );

  for (const linkDoc of byFieldSnap.docs) {
    deleteRefs.set(linkDoc.ref.path, linkDoc.ref);
    const parentId = linkDoc.data().parentId as string | undefined;
    if (parentId) parentIds.add(parentId);
  }

  const suffix = `_${studentId}`;
  const allLinksSnap = await getDocs(collection(schoolDb, "parentStudents"));
  for (const linkDoc of allLinksSnap.docs) {
    if (linkDoc.id.endsWith(suffix)) {
      deleteRefs.set(linkDoc.ref.path, linkDoc.ref);
      const parentId = linkDoc.id.slice(0, -suffix.length);
      if (parentId) parentIds.add(parentId);
    } else if (linkDoc.data().studentId === studentId) {
      deleteRefs.set(linkDoc.ref.path, linkDoc.ref);
      const parentId = linkDoc.data().parentId as string | undefined;
      if (parentId) parentIds.add(parentId);
    }
  }

  const refs = [...deleteRefs.values()];
  const BATCH_SIZE = 400;
  for (let i = 0; i < refs.length; i += BATCH_SIZE) {
    const batch = writeBatch(schoolDb);
    for (const ref of refs.slice(i, i + BATCH_SIZE)) {
      batch.delete(ref);
    }
    await batch.commit();
  }

  await Promise.all(
    [...parentIds].map((parentId) =>
      setDoc(
        doc(schoolDb, "users", parentId),
        { linkedStudentIds: arrayRemove(studentId) },
        { merge: true },
      ),
    ),
  );
}

/**
 * Student IDs linked to a parent. Uses parentStudents as source of truth so stale
 * entries left in users.linkedStudentIds (e.g. after a student was removed) are ignored.
 */
export async function collectLinkedStudentIds(parentId: string): Promise<string[]> {
  if (!db) return [];
  const schoolDb = requireSchoolDb();

  const ids = new Set<string>();

  const linkSnap = await getDocs(
    query(
      collection(schoolDb, "parentStudents"),
      where("parentId", "==", parentId),
    ),
  );
  for (const linkDoc of linkSnap.docs) {
    const studentId = linkDoc.data().studentId as string | undefined;
    if (studentId) {
      ids.add(studentId);
      continue;
    }
    const prefix = `${parentId}_`;
    if (linkDoc.id.startsWith(prefix) && linkDoc.id.length > prefix.length) {
      ids.add(linkDoc.id.slice(prefix.length));
    }
  }

  try {
    const legacySnap = await getDoc(doc(schoolDb, "parentStudents", parentId));
    if (legacySnap.exists()) {
      const legacyStudentId = legacySnap.data()?.studentId as string | undefined;
      if (legacyStudentId) ids.add(legacyStudentId);
    }
  } catch (err) {
    console.warn("Could not read legacy parentStudents link:", err);
  }

  if (ids.size > 0) {
    return [...ids];
  }

  // No link docs — fall back to profile list (older schools before reconcile).
  const parentSnap = await getDoc(doc(schoolDb, "users", parentId));
  const fromProfile = parentSnap.data()?.linkedStudentIds;
  if (Array.isArray(fromProfile)) {
    for (const id of fromProfile) {
      if (typeof id === "string" && id) ids.add(id);
    }
  }

  return [...ids];
}
