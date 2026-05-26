import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type TeacherClass = {
  id: string;
  name?: string;
  grade?: string;
  [key: string]: unknown;
};

/** Loads class documents assigned to a teacher via teacherClasses. */
export async function loadClassesForTeacher(
  teacherId: string,
): Promise<TeacherClass[]> {
  if (!teacherId) return [];

  const teacherSnap = await getDocs(
    query(
      collection(db, "teacherClasses"),
      where("teacherId", "==", teacherId),
    ),
  );

  const classIds = [
    ...new Set(
      teacherSnap.docs
        .map((d) => d.data().classId as string)
        .filter(Boolean),
    ),
  ];

  if (classIds.length === 0) return [];

  const classData = await Promise.all(
    classIds.map(async (id) => {
      try {
        const classSnap = await getDoc(doc(db, "classes", id));
        if (!classSnap.exists()) return null;
        return { id: classSnap.id, ...classSnap.data() } as TeacherClass;
      } catch (err) {
        console.warn("Failed to load class", id, err);
        return null;
      }
    }),
  );

  return classData.filter(Boolean) as TeacherClass[];
}
