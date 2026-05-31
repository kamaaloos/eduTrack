import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { fetchStudentAttendanceHistory } from "./attendanceQueries";
import { parseFirestoreDate } from "../utils/academicFilters";
import {
  getExamResultsForStudent,
  markExamResultsSeenByParent,
} from "./examResults";
import { getGrade } from "../utils/letterGrade";

function scorePercentFromExam(
  score: number | null,
  maxMarks: number | null,
): number | null {
  if (score == null || !Number.isFinite(score)) return null;
  if (maxMarks != null && maxMarks > 0) return (score / maxMarks) * 100;
  return score;
}

/** Average and subject rows from graded exams + optional subject grades. */
function deriveStudentPerformance(
  gradeSubjects: { subject: string; score: number; grade: string }[],
  exams: ReportExamRow[],
): {
  subjects: { subject: string; score: number; grade: string }[];
  average: number;
  grade: string;
} {
  const examPercents: { subject: string; percent: number }[] = [];
  for (const exam of exams) {
    if (!exam.graded) continue;
    const percent = scorePercentFromExam(exam.score, exam.maxMarks);
    if (percent == null) continue;
    examPercents.push({
      subject: (exam.subject || "General").trim() || "General",
      percent,
    });
  }

  const gradeAverage =
    gradeSubjects.length > 0
      ? gradeSubjects.reduce((sum, s) => sum + s.score, 0) / gradeSubjects.length
      : 0;

  if (gradeSubjects.length > 0 && gradeAverage > 0) {
    return {
      subjects: gradeSubjects,
      average: Number(gradeAverage.toFixed(1)),
      grade: getGrade(gradeAverage),
    };
  }

  if (examPercents.length === 0) {
    return { subjects: [], average: 0, grade: "N/A" };
  }

  const bySubject = new Map<string, number[]>();
  for (const { subject, percent } of examPercents) {
    if (!bySubject.has(subject)) bySubject.set(subject, []);
    bySubject.get(subject)!.push(percent);
  }

  const subjects = Array.from(bySubject.entries()).map(([subject, scores]) => {
    const score = scores.reduce((a, b) => a + b, 0) / scores.length;
    const rounded = Number(score.toFixed(1));
    return { subject, score: rounded, grade: getGrade(rounded) };
  });

  const average =
    examPercents.reduce((sum, e) => sum + e.percent, 0) / examPercents.length;
  const roundedAvg = Number(average.toFixed(1));

  return {
    subjects,
    average: roundedAvg,
    grade: getGrade(roundedAvg),
  };
}

export type ReportExamRow = {
  examId: string;
  subject: string;
  title: string;
  dateLabel?: string;
  maxMarks: number | null;
  score: number | null;
  graded: boolean;
  parentSeen: boolean;
};

export type ReportAttendanceRow = {
  id: string;
  dateLabel: string;
  status: string;
  parentResponse?: { reasonCode?: string; reason?: string } | null;
  remark?: string;
};

export type ReportAttendanceSummary = {
  rate: number | null;
  present: number;
  total: number;
  records: ReportAttendanceRow[];
};

export type ReportCardData = {
  studentName: string;
  classId: string | null;
  subjects: { subject: string; score: number; grade: string }[];
  average: number;
  grade: string;
  exams: ReportExamRow[];
  attendance: ReportAttendanceSummary;
};

function formatAttendanceDate(value: unknown): string {
  const parsed = parseFirestoreDate(value as Parameters<typeof parseFirestoreDate>[0]);
  if (parsed) return parsed.toLocaleDateString();
  if (value != null && String(value).trim()) return String(value);
  return "—";
}

async function loadStudentAttendance(
  studentId: string,
): Promise<ReportAttendanceSummary> {
  const empty: ReportAttendanceSummary = {
    rate: null,
    present: 0,
    total: 0,
    records: [],
  };

  try {
    const rows = await fetchStudentAttendanceHistory(studentId);

    const present = rows.filter((r) => r.status === "present").length;
    const rate =
      rows.length > 0 ? Math.round((present / rows.length) * 100) : null;

    return {
      rate,
      present,
      total: rows.length,
      records: rows.slice(0, 15).map((r) => ({
        id: r.id,
        dateLabel: formatAttendanceDate(r.date),
        status: String(r.status || "unknown"),
        parentResponse:
          (r.parentResponse as ReportAttendanceRow["parentResponse"]) ?? null,
        remark: typeof r.remark === "string" ? r.remark : undefined,
      })),
    };
  } catch {
    return empty;
  }
}

export async function generateReportCard(
  studentId: string,
  options?: {
    parentId?: string;
    markParentSeen?: boolean;
    /** When student profile lacks classId (e.g. teacher opened from class roster). */
    classId?: string | null;
    studentName?: string;
  },
): Promise<ReportCardData> {
  let userData: Record<string, unknown> = {};
  try {
    const userSnap = await getDoc(doc(db, "users", studentId));
    if (userSnap.exists()) userData = userSnap.data() as Record<string, unknown>;
  } catch {
    /* teacher may read via classId param only */
  }
  let classId =
    options?.classId || (userData.classId as string) || null;

  if (!classId) {
    try {
      const linkSnap = await getDocs(
        query(
          collection(db, "studentClasses"),
          where("studentId", "==", studentId),
        ),
      );
      classId = (linkSnap.docs[0]?.data()?.classId as string) || null;
    } catch {
      /* rules may block; caller can pass classId */
    }
  }

  const studentName =
    options?.studentName || (userData.name as string) || "Student";

  const gradesSnap = await getDocs(
    query(collection(db, "grades"), where("studentId", "==", studentId)),
  );

  const grades = gradesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const usedGradeIds = new Set<string>();

  const gradeSubjects =
    grades.length > 0
      ? grades.map((g: { subject?: string; score?: number }) => ({
          subject: g.subject || "Subject",
          score: Number(g.score) || 0,
          grade: getGrade(Number(g.score) || 0),
        }))
      : [];

  let exams: ReportExamRow[] = [];

  if (classId) {
    const examsSnap = await getDocs(
      collection(db, "classes", classId, "exams"),
    );
    const classExams = examsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const examResults = await getExamResultsForStudent(studentId, {
      examIds: classExams.map((e) => e.id),
    });
    const resultByExamId = new Map(
      examResults.map((r) => [r.examId, r]),
    );

    exams = classExams.map((exam) => {
      const result = resultByExamId.get(exam.id);
      let score: number | null = result?.graded ? result.score ?? null : null;
      let graded = result?.graded ?? false;

      if (!graded) {
        const gradeMatch = grades.find(
          (g: { id: string; subject?: string }) =>
            !usedGradeIds.has(g.id) &&
            (g.subject || "").trim().toLowerCase() ===
              (exam.subject || "").trim().toLowerCase(),
        );
        if (gradeMatch) {
          usedGradeIds.add(gradeMatch.id);
          score = Number((gradeMatch as { score?: number }).score);
          graded = Number.isFinite(score);
        }
      }

      const dateLabel =
        exam.date ||
        (parseFirestoreDate(exam.examDate)
          ? parseFirestoreDate(exam.examDate)!.toLocaleDateString()
          : undefined);

      return {
        examId: exam.id,
        subject: exam.subject || "General",
        title: exam.title || exam.date || "Exam",
        dateLabel,
        maxMarks:
          result?.maxMarks ??
          (exam.marks != null ? Number(exam.marks) : null),
        score: graded ? score : null,
        graded,
        parentSeen: Boolean(result?.parentSeenAt),
      };
    });
  }

  if (options?.markParentSeen && options.parentId) {
    const unseen = exams.filter((e) => !e.parentSeen);
    if (unseen.length > 0 && classId) {
      await markExamResultsSeenByParent(
        studentId,
        options.parentId,
        unseen.map((e) => ({
          examId: e.examId,
          classId,
          subject: e.subject,
          title: e.title,
        })),
      );
      exams = exams.map((e) => ({ ...e, parentSeen: true }));
    }
  }

  const performance = deriveStudentPerformance(gradeSubjects, exams);
  const attendance = await loadStudentAttendance(studentId);

  return {
    studentName,
    classId,
    subjects: performance.subjects,
    average: performance.average,
    grade: performance.grade,
    exams,
    attendance,
  };
}
