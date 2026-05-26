import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

export type ExamResultRecord = {
  studentId: string;
  examId: string;
  classId: string;
  subject: string;
  examTitle: string;
  score: number | null;
  maxMarks: number | null;
  graded: boolean;
  parentSeenAt?: unknown;
  parentSeenBy?: string;
  updatedAt?: unknown;
};

function resultDocId(studentId: string, examId: string) {
  return `${studentId}_${examId}`;
}

/** getDoc only — rules deny read when the document does not exist yet. */
export async function getExamResultSafe(
  studentId: string,
  examId: string,
): Promise<ExamResultRecord | null> {
  try {
    const snap = await getDoc(
      doc(db, "examResults", resultDocId(studentId, examId)),
    );
    return snap.exists() ? (snap.data() as ExamResultRecord) : null;
  } catch {
    return null;
  }
}

export async function getExamResultsForStudent(
  studentId: string,
  options?: { examIds?: string[] },
): Promise<ExamResultRecord[]> {
  if (options?.examIds?.length) {
    const rows = await Promise.all(
      options.examIds.map((examId) => getExamResultSafe(studentId, examId)),
    );
    return rows.filter((r): r is ExamResultRecord => r != null);
  }

  try {
    const snap = await getDocs(
      query(collection(db, "examResults"), where("studentId", "==", studentId)),
    );
    return snap.docs.map((d) => d.data() as ExamResultRecord);
  } catch {
    return [];
  }
}

/** Loads scores for a class without a classId collection query (rules-safe). */
export async function getExamResultsForClass(
  studentIds: string[],
  examIds: string[],
): Promise<ExamResultRecord[]> {
  if (!studentIds.length || !examIds.length) return [];

  const rows = await Promise.all(
    studentIds.flatMap((studentId) =>
      examIds.map((examId) => getExamResultSafe(studentId, examId)),
    ),
  );
  return rows.filter((r): r is ExamResultRecord => r != null);
}

export async function upsertExamResultForExam(input: {
  studentId: string;
  examId: string;
  classId: string;
  subject: string;
  examTitle: string;
  score: number;
  maxMarks?: number | null;
  teacherId?: string;
}): Promise<void> {
  const ref = doc(db, "examResults", resultDocId(input.studentId, input.examId));

  await setDoc(
    ref,
    {
      studentId: input.studentId,
      examId: input.examId,
      classId: input.classId,
      subject: input.subject,
      examTitle: input.examTitle,
      score: input.score,
      maxMarks: input.maxMarks ?? null,
      graded: true,
      ...(input.teacherId ? { teacherId: input.teacherId } : {}),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function upsertExamResultFromGrade(input: {
  studentId: string;
  classId: string;
  subject: string;
  score: number;
}): Promise<void> {
  const examsSnap = await getDocs(
    collection(db, "classes", input.classId, "exams"),
  );
  const exams = examsSnap.docs.map((d) => {
    const data = d.data() as {
      subject?: string;
      title?: string;
      date?: string;
      marks?: number;
    };
    return { id: d.id, ...data };
  });

  const match = exams.find(
    (e) =>
      (e.subject || "").trim().toLowerCase() ===
      input.subject.trim().toLowerCase(),
  );
  if (!match) return;

  await upsertExamResultForExam({
    studentId: input.studentId,
    examId: match.id,
    classId: input.classId,
    subject: input.subject,
    examTitle: match.title || match.date || "Exam",
    score: input.score,
    maxMarks: match.marks ?? null,
  });
}

export async function markExamResultsSeenByParent(
  studentId: string,
  parentId: string,
  exams: {
    examId: string;
    classId: string;
    subject: string;
    title: string;
  }[],
): Promise<void> {
  if (!exams.length) return;

  const batch = writeBatch(db);
  const now = serverTimestamp();

  for (const exam of exams) {
    const ref = doc(db, "examResults", resultDocId(studentId, exam.examId));
    batch.set(
      ref,
      {
        studentId,
        examId: exam.examId,
        classId: exam.classId,
        subject: exam.subject,
        examTitle: exam.title,
        parentSeenAt: now,
        parentSeenBy: parentId,
        updatedAt: now,
      },
      { merge: true },
    );
  }

  await batch.commit();
}
