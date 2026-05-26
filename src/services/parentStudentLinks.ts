import {
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
} from "firebase/firestore";
import { db } from "./firebase";
import { syncParentClassAccess } from "./parentClassAccess";

export function parentStudentLinkId(parentId: string, studentId: string): string {
  return `${parentId}_${studentId}`;
}

/** Admin: normalize parentStudents docs and parent profile linkedStudentIds. */
export async function reconcileParentStudentLinks(): Promise<void> {
  const snap = await getDocs(collection(db, "parentStudents"));
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
        doc(db, "parentStudents", expectedId),
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
        doc(db, "users", parentId),
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
  const linkId = parentStudentLinkId(parentId, studentId);

  await setDoc(
    doc(db, "parentStudents", linkId),
    {
      parentId,
      studentId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await setDoc(
    doc(db, "users", parentId),
    { linkedStudentIds: arrayUnion(studentId) },
    { merge: true },
  );

  const legacyRef = doc(db, "parentStudents", parentId);
  const legacySnap = await getDoc(legacyRef);
  if (legacySnap.exists()) {
    const legacyStudentId = legacySnap.data()?.studentId as string | undefined;
    if (legacyStudentId && legacyStudentId !== studentId) {
      await setDoc(
        doc(db, "parentStudents", parentStudentLinkId(parentId, legacyStudentId)),
        {
          parentId,
          studentId: legacyStudentId,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      await setDoc(
        doc(db, "users", parentId),
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

/** Collects all student IDs linked to a parent (query + profile). */
export async function collectLinkedStudentIds(parentId: string): Promise<string[]> {
  const ids = new Set<string>();

  const parentSnap = await getDoc(doc(db, "users", parentId));
  const fromProfile = parentSnap.data()?.linkedStudentIds;
  if (Array.isArray(fromProfile)) {
    for (const id of fromProfile) {
      if (typeof id === "string" && id) ids.add(id);
    }
  }

  const linkSnap = await getDocs(
    query(
      collection(db, "parentStudents"),
      where("parentId", "==", parentId),
    ),
  );
  for (const linkDoc of linkSnap.docs) {
    const studentId = linkDoc.data().studentId as string | undefined;
    if (studentId) ids.add(studentId);
  }

  return [...ids];
}
