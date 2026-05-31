import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { syncParentClassAccess } from "./parentClassAccess";
import { collectLinkedStudentIds } from "./parentStudentLinks";

export { syncParentClassAccess } from "./parentClassAccess";

export type ParentChild = {
  id: string;
  name: string;
  email?: string;
  photoURL?: string | null;
  classId?: string;
  className?: string;
};

export type LoadParentChildrenResult = {
  children: ParentChild[];
  failedStudentIds: string[];
};

export async function loadParentChildren(
  parentId: string,
): Promise<ParentChild[]> {
  const result = await loadParentChildrenDetailed(parentId);
  return result.children;
}

export async function loadParentChildrenDetailed(
  parentId: string,
): Promise<LoadParentChildrenResult> {
  const studentIds = await collectLinkedStudentIds(parentId);

  if (studentIds.length === 0) {
    return { children: [], failedStudentIds: [] };
  }

  const failedStudentIds: string[] = [];

  const settled = await Promise.allSettled(
    studentIds.map(async (studentId) => {
      const userSnap = await getDoc(doc(db, "users", studentId));
      if (!userSnap.exists()) {
        throw new Error(`Student profile not found (${studentId})`);
      }

      const data = userSnap.data();
      let classId = data.classId as string | undefined;
      let className: string | undefined;

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

      if (classId) {
        await syncParentClassAccess(parentId, studentId);
        const classSnap = await getDoc(doc(db, "classes", classId));
        if (classSnap.exists()) {
          className = classSnap.data().name as string;
        }
      }

      const photoURL =
        typeof data.photoURL === "string" && data.photoURL.trim()
          ? data.photoURL.trim()
          : null;

      return {
        id: studentId,
        name: (data.name as string) || (data.email as string) || "Student",
        email: data.email as string | undefined,
        photoURL,
        classId,
        className,
      } satisfies ParentChild;
    }),
  );

  const children: ParentChild[] = [];
  for (let i = 0; i < settled.length; i++) {
    const outcome = settled[i];
    if (outcome.status === "fulfilled") {
      children.push(outcome.value);
    } else {
      failedStudentIds.push(studentIds[i]);
      console.warn(
        `Could not load child ${studentIds[i]}:`,
        outcome.reason,
      );
    }
  }

  children.sort((a, b) => a.name.localeCompare(b.name));
  return { children, failedStudentIds };
}
