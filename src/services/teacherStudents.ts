import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type TeacherStudent = {
  id: string;
  name?: string;
  email?: string;
  classId: string;
  [key: string]: unknown;
};

export type TeacherStudentsResult = {
  students: TeacherStudent[];
  totalCount: number;
  countByClass: Map<string, number>;
};

function buildCountByClass(
  classByStudentId: Map<string, string>,
): Map<string, number> {
  const countByClass = new Map<string, number>();
  classByStudentId.forEach((classId) => {
    countByClass.set(classId, (countByClass.get(classId) || 0) + 1);
  });
  return countByClass;
}

/** Query studentClasses per class (required for teacher-scoped security rules). */
async function loadStudentsFromClassLinks(
  classIds: string[],
): Promise<Map<string, string>> {
  const classByStudentId = new Map<string, string>();

  await Promise.all(
    classIds.map(async (classId) => {
      try {
        const snap = await getDocs(
          query(
            collection(db, "studentClasses"),
            where("classId", "==", classId),
          ),
        );

        snap.docs.forEach((docSnap) => {
          const studentId = docSnap.data().studentId as string | undefined;
          if (studentId) {
            classByStudentId.set(studentId, classId);
          }
        });
      } catch (err) {
        console.warn("studentClasses query failed for class", classId, err);
      }
    }),
  );

  return classByStudentId;
}

/** One equality query per class so Firestore rules can authorize the list. */
async function mergeStudentsFromUserProfiles(
  classIds: string[],
  classByStudentId: Map<string, string>,
): Promise<void> {
  await Promise.all(
    classIds.map(async (classId) => {
      try {
        const snap = await getDocs(
          query(
            collection(db, "users"),
            where("role", "==", "student"),
            where("classId", "==", classId),
          ),
        );

        snap.docs.forEach((docSnap) => {
          classByStudentId.set(docSnap.id, classId);
        });
      } catch (err) {
        console.warn("users query failed for class", classId, err);
      }
    }),
  );
}

async function loadStudentProfilesSafe(
  classByStudentId: Map<string, string>,
): Promise<TeacherStudent[]> {
  const results: TeacherStudent[] = [];

  for (const [studentId, classId] of classByStudentId) {
    try {
      const snap = await getDoc(doc(db, "users", studentId));
      if (snap.exists() && snap.data().role === "student") {
        results.push({
          id: studentId,
          ...snap.data(),
          classId: (snap.data().classId as string) || classId,
        });
        continue;
      }
    } catch {
      // Fall through to placeholder when rules block profile read
    }

    results.push({
      id: studentId,
      name: "Student",
      classId,
    });
  }

  return results;
}

export async function getTeacherClassIds(teacherId: string): Promise<string[]> {
  const teacherSnap = await getDocs(
    query(
      collection(db, "teacherClasses"),
      where("teacherId", "==", teacherId),
    ),
  );

  return teacherSnap.docs
    .map((d) => d.data().classId as string)
    .filter(Boolean);
}

/**
 * Loads students for a teacher's assigned classes.
 * Counts from studentClasses links + users.classId (never throws).
 */
export async function loadStudentsForTeacher(
  teacherId: string,
): Promise<TeacherStudentsResult> {
  const classIds = await getTeacherClassIds(teacherId);

  if (classIds.length === 0) {
    return { students: [], totalCount: 0, countByClass: new Map() };
  }

  const classByStudentId = await loadStudentsFromClassLinks(classIds);
  await mergeStudentsFromUserProfiles(classIds, classByStudentId);

  const totalCount = classByStudentId.size;
  const countByClass = buildCountByClass(classByStudentId);
  const students = await loadStudentProfilesSafe(classByStudentId);

  return {
    students,
    totalCount,
    countByClass,
  };
}

/** Loads students for one class the teacher is assigned to (rules-safe queries). */
export async function loadStudentsForClass(
  teacherId: string,
  classId: string,
): Promise<TeacherStudent[]> {
  if (!teacherId || !classId) return [];

  const classIds = await getTeacherClassIds(teacherId);
  if (!classIds.includes(classId)) return [];

  const classByStudentId = await loadStudentsFromClassLinks([classId]);
  await mergeStudentsFromUserProfiles([classId], classByStudentId);

  const students = await loadStudentProfilesSafe(classByStudentId);
  return students.sort((a, b) =>
    (a.name || a.email || a.id).localeCompare(b.name || b.email || b.id),
  );
}
