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
import { requireSchoolDb } from "./firebase";

/** Ensures parent can read class subcollections (homework, exams, announcements). */
export async function syncParentClassAccess(
  parentId: string,
  studentId: string,
): Promise<void> {
  const schoolDb = requireSchoolDb();
  const userSnap = await getDoc(doc(schoolDb, "users", studentId));
  let classId = userSnap.data()?.classId as string | undefined;

  if (!classId) {
    const scSnap = await getDocs(
      query(
        collection(schoolDb, "studentClasses"),
        where("studentId", "==", studentId),
      ),
    );
    if (!scSnap.empty) {
      classId = scSnap.docs[0].data().classId as string;
    }
  }

  if (!classId) return;

  await setDoc(
    doc(schoolDb, "parentClassAccess", `${parentId}_${classId}`),
    {
      parentId,
      classId,
      studentId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
