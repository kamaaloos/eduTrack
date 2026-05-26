import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export async function getStudentIdsInClass(classId: string): Promise<string[]> {
  if (!db || !classId) return [];

  const ids = new Set<string>();

  try {
    const linkSnap = await getDocs(
      query(
        collection(db, "studentClasses"),
        where("classId", "==", classId),
      ),
    );
    linkSnap.docs.forEach((d) => {
      const studentId = d.data().studentId as string | undefined;
      if (studentId) ids.add(studentId);
    });
  } catch (err) {
    console.warn("getStudentIdsInClass studentClasses:", err);
  }

  try {
    const profileSnap = await getDocs(
      query(
        collection(db, "users"),
        where("role", "==", "student"),
        where("classId", "==", classId),
      ),
    );
    profileSnap.docs.forEach((d) => ids.add(d.id));
  } catch (err) {
    console.warn("getStudentIdsInClass users:", err);
  }

  return [...ids];
}

export async function getParentIdsForStudent(studentId: string): Promise<string[]> {
  if (!db || !studentId) return [];

  const ids = new Set<string>();

  try {
    const snap = await getDocs(
      query(
        collection(db, "parentStudents"),
        where("studentId", "==", studentId),
      ),
    );
    snap.docs.forEach((d) => {
      const parentId = d.data().parentId as string | undefined;
      if (parentId) ids.add(parentId);
    });
  } catch (err) {
    console.warn("getParentIdsForStudent:", err);
  }

  return [...ids];
}

export async function getTeacherIdsForClass(classId: string): Promise<string[]> {
  if (!db || !classId) return [];

  try {
    const snap = await getDocs(
      query(
        collection(db, "teacherClasses"),
        where("classId", "==", classId),
      ),
    );
    return [
      ...new Set(
        snap.docs
          .map((d) => d.data().teacherId as string | undefined)
          .filter(Boolean) as string[],
      ),
    ];
  } catch (err) {
    console.warn("getTeacherIdsForClass:", err);
    return [];
  }
}

export async function getParentIdsForStudents(
  studentIds: string[],
): Promise<Map<string, string[]>> {
  const byStudent = new Map<string, string[]>();

  await Promise.all(
    studentIds.map(async (studentId) => {
      const parentIds = await getParentIdsForStudent(studentId);
      byStudent.set(studentId, parentIds);
    }),
  );

  return byStudent;
}
