import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

/** Ensures parent can read class subcollections (homework, exams, announcements). */
export async function syncParentClassAccess(
  parentId: string,
  studentId: string,
): Promise<void> {
  const userSnap = await getDoc(doc(db, "users", studentId));
  let classId = userSnap.data()?.classId as string | undefined;

  if (!classId) {
    const scSnap = await getDocs(
      query(
        collection(db, "studentClasses"),
        where("studentId", "==", studentId),
      ),
    );
    if (!scSnap.empty) {
      classId = scSnap.docs[0].data().classId as string;
    }
  }

  if (!classId) return;

  await setDoc(
    doc(db, "parentClassAccess", `${parentId}_${classId}`),
    {
      parentId,
      classId,
      studentId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
