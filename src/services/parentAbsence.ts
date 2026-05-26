import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { absenceReasonLabel } from "../constants/absenceReasons";
import { notifyTeachersParentAbsenceReport } from "./notificationEvents";
import { db } from "./firebase";

async function resolveStudentClassId(studentId: string): Promise<string | null> {
  const userSnap = await getDoc(doc(db, "users", studentId));
  const fromProfile = userSnap.data()?.classId as string | undefined;
  if (fromProfile) return fromProfile;

  const scSnap = await getDocs(
    query(
      collection(db, "studentClasses"),
      where("studentId", "==", studentId),
    ),
  );
  if (!scSnap.empty) {
    return scSnap.docs[0].data().classId as string;
  }
  return null;
}

async function resolveStudentName(studentId: string): Promise<string> {
  const userSnap = await getDoc(doc(db, "users", studentId));
  const data = userSnap.data();
  return (
    (data?.name as string) ||
    (data?.email as string) ||
    "Student"
  );
}

export async function submitParentAbsenceReport(params: {
  parentId: string;
  studentId: string;
  reasonCode: string;
  notes?: string;
  classId?: string;
  studentName?: string;
}): Promise<void> {
  const { parentId, studentId, reasonCode, notes } = params;
  const reason = absenceReasonLabel(reasonCode);
  const classId =
    params.classId?.trim() || (await resolveStudentClassId(studentId));

  await addDoc(collection(db, "parentRemarks"), {
    parentId,
    studentId,
    classId: classId || null,
    type: "absence",
    reasonCode,
    reason,
    notes: notes?.trim() || null,
    createdAt: serverTimestamp(),
  });

  if (classId) {
    const studentName =
      params.studentName?.trim() || (await resolveStudentName(studentId));
    void notifyTeachersParentAbsenceReport({
      classId,
      studentId,
      studentName,
      reason,
      parentId,
    });
  }
}
