import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { normalizeSubjectKey } from "../utils/subjectKey";

export type TeacherSubjectAssignment = {
  id: string;
  teacherId: string;
  classId: string;
  subject: string;
  subjectKey: string;
};

export async function loadTeacherSubjectAssignments(
  teacherId: string,
): Promise<TeacherSubjectAssignment[]> {
  if (!teacherId) return [];

  const snap = await getDocs(
    query(
      collection(db, "teacherSubjects"),
      where("teacherId", "==", teacherId),
    ),
  );

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      teacherId: data.teacherId as string,
      classId: data.classId as string,
      subject: data.subject as string,
      subjectKey: (data.subjectKey as string) || normalizeSubjectKey(data.subject as string),
    };
  });
}

export async function loadSubjectsForTeacherClass(
  teacherId: string,
  classId: string,
): Promise<string[]> {
  const assignments = await loadTeacherSubjectAssignments(teacherId);
  const forClass = assignments
    .filter((a) => a.classId === classId)
    .map((a) => a.subject)
    .filter(Boolean);

  if (forClass.length > 0) {
    return [...new Set(forClass)];
  }

  const classSnap = await getDoc(doc(db, "classes", classId));
  if (!classSnap.exists()) return [];

  const classSubjects = classSnap.data().subjects;
  const subjectsList = Array.isArray(classSubjects)
    ? classSubjects.map((s) => String(s).trim()).filter(Boolean)
    : [];

  const classLink = await getDoc(
    doc(db, "teacherClasses", `${teacherId}_${classId}`),
  );
  if (classLink.exists() && subjectsList.length > 0) {
    return subjectsList;
  }

  return [];
}
