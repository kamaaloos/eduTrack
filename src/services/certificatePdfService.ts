import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import type { ClassExam } from "../components/teachers/examReports/examReportsTypes";
import {
  buildTermExamClassCertificatesHtml,
  buildYearlyClassCertificatesHtml,
  type TermExamCertificateLabels,
  type YearlyCertificateLabels,
  type YearlyStudentCertificate,
  type YearlySubjectRow,
} from "./certificatePdfTemplates";
import { getExamResultsForClass, type ExamResultRecord } from "./examResults";
import { db } from "./firebase";
import { shareHtmlAsPdf } from "./pdfShare";
import { examDateInAcademicYear, formatAcademicYear } from "../utils/academicYear";
import { getGrade } from "../utils/letterGrade";

export type TermExamCertificateParams = {
  schoolName: string;
  className: string;
  studentName: string;
  subject: string;
  examTitle: string;
  examDate?: string;
  score: number;
  maxMarks: number | null;
  teacherName?: string;
};

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export function getTermExamCertificateLabels(t: TranslateFn): TermExamCertificateLabels {
  return {
    documentTitle: t("certificates.termExamTitle"),
    certifies: t("certificates.termExamCertifies"),
    subject: t("common.subject"),
    exam: t("common.exams"),
    examDate: t("certificates.examDate"),
    score: t("certificates.score"),
    grade: t("certificates.grade"),
    classLabel: t("common.class"),
    issuedOn: t("certificates.issuedOn"),
    teacherSignature: t("certificates.teacherSignature"),
  };
}

export function getYearlyCertificateLabels(t: TranslateFn): YearlyCertificateLabels {
  return {
    documentTitle: t("certificates.yearlyTitle"),
    academicYear: t("certificates.academicYear"),
    student: t("common.student"),
    classLabel: t("common.class"),
    subject: t("common.subject"),
    termExams: t("certificates.termExamColumn"),
    average: t("certificates.average"),
    grade: t("certificates.grade"),
    overallAverage: t("certificates.overallAverage"),
    overallGrade: t("certificates.overallGrade"),
    issuedOn: t("certificates.issuedOn"),
    noResults: t("certificates.noSubjectResults"),
  };
}

export async function shareTermExamCertificatePdf(
  params: TermExamCertificateParams,
  labels: TermExamCertificateLabels,
): Promise<void> {
  await shareTermExamCertificatesPdf([params], labels, {
    fileName: `term-exam-${params.studentName}-${params.examTitle}.pdf`,
    dialogTitle: labels.documentTitle,
  });
}

export async function shareTermExamCertificatesPdf(
  paramsList: TermExamCertificateParams[],
  labels: TermExamCertificateLabels,
  options: { fileName: string; dialogTitle: string },
): Promise<number> {
  if (paramsList.length === 0) {
    throw new Error("NO_CERTIFICATE_DATA");
  }

  const issuedDate = new Date().toLocaleDateString();
  const html = buildTermExamClassCertificatesHtml(
    paramsList.map((params) => ({ ...params, issuedDate })),
    labels,
  );

  await shareHtmlAsPdf(html, options.fileName, options.dialogTitle);
  return paramsList.length;
}

type ClassStudent = {
  id: string;
  name: string;
};

function scorePercent(score: number, maxMarks: number | null): number {
  if (maxMarks != null && maxMarks > 0) return (score / maxMarks) * 100;
  return score;
}

function formatScoreLabel(score: number, maxMarks: number | null): string {
  if (maxMarks != null) return `${score}/${maxMarks}`;
  return `${score}%`;
}

async function loadClassStudents(classId: string): Promise<ClassStudent[]> {
  const snap = await getDocs(
    query(collection(db, "studentClasses"), where("classId", "==", classId)),
  );
  const studentIds = snap.docs
    .map((docSnap) => docSnap.data().studentId as string | undefined)
    .filter((id): id is string => Boolean(id));

  const resolved: ClassStudent[] = [];
  for (const studentId of studentIds) {
    try {
      const userSnap = await getDoc(doc(db, "users", studentId));
      const name =
        userSnap.exists() && typeof userSnap.data().name === "string"
          ? userSnap.data().name
          : studentId;
      resolved.push({ id: studentId, name });
    } catch {
      resolved.push({ id: studentId, name: studentId });
    }
  }
  return resolved.sort((a, b) => a.name.localeCompare(b.name));
}

async function loadClassExams(classId: string): Promise<ClassExam[]> {
  const snap = await getDocs(collection(db, "classes", classId, "exams"));
  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<ClassExam, "id">),
  }));
}

function buildYearlyRowsForStudent(
  exams: ClassExam[],
  results: ExamResultRecord[],
  academicYearStart: number,
): YearlySubjectRow[] {
  const gradedByExam = new Map(
    results.filter((row) => row.graded && row.score != null).map((row) => [row.examId, row]),
  );

  const bySubject = new Map<
    string,
    { subject: string; exams: YearlySubjectRow["exams"]; percents: number[] }
  >();

  for (const exam of exams) {
    if (!examDateInAcademicYear(exam.date, academicYearStart)) continue;
    const result = gradedByExam.get(exam.id);
    if (!result || result.score == null) continue;

    const subject = (exam.subject || result.subject || "General").trim() || "General";
    const percent = scorePercent(result.score, result.maxMarks ?? exam.marks ?? null);
    const grade = getGrade(percent);
    const cell = {
      title: exam.title || result.examTitle || subject,
      dateLabel: exam.date,
      scoreLabel: formatScoreLabel(
        result.score,
        result.maxMarks ?? exam.marks ?? null,
      ),
      grade,
    };

    if (!bySubject.has(subject)) {
      bySubject.set(subject, { subject, exams: [], percents: [] });
    }
    const bucket = bySubject.get(subject)!;
    bucket.exams.push(cell);
    bucket.percents.push(percent);
  }

  return Array.from(bySubject.values())
    .map(({ subject, exams: examCells, percents }) => {
      const average = Number(
        (percents.reduce((sum, value) => sum + value, 0) / percents.length).toFixed(1),
      );
      return {
        subject,
        exams: examCells,
        average,
        grade: getGrade(average),
      };
    })
    .sort((a, b) => a.subject.localeCompare(b.subject));
}

export async function buildYearlyCertificatesForClass(
  classId: string,
  className: string,
  academicYearStart: number,
): Promise<YearlyStudentCertificate[]> {
  const [students, exams] = await Promise.all([
    loadClassStudents(classId),
    loadClassExams(classId),
  ]);

  if (students.length === 0 || exams.length === 0) return [];

  const examIds = exams.map((exam) => exam.id);
  const results = await getExamResultsForClass(
    students.map((student) => student.id),
    examIds,
  );

  const resultsByStudent = new Map<string, ExamResultRecord[]>();
  for (const row of results) {
    if (!resultsByStudent.has(row.studentId)) {
      resultsByStudent.set(row.studentId, []);
    }
    resultsByStudent.get(row.studentId)!.push(row);
  }

  const academicYearLabel = formatAcademicYear(academicYearStart);

  return students.map((student) => {
    const rows = buildYearlyRowsForStudent(
      exams,
      resultsByStudent.get(student.id) ?? [],
      academicYearStart,
    );
    const overallAverage =
      rows.length > 0
        ? Number(
            (
              rows.reduce((sum, row) => sum + row.average, 0) / rows.length
            ).toFixed(1),
          )
        : 0;

    return {
      studentName: student.name,
      className,
      academicYearLabel,
      rows,
      overallAverage,
      overallGrade: rows.length > 0 ? getGrade(overallAverage) : "N/A",
    };
  });
}

export async function shareYearlyClassCertificatesPdf(
  schoolName: string,
  classId: string,
  className: string,
  academicYearStart: number,
  labels: YearlyCertificateLabels,
): Promise<number> {
  const certificates = await buildYearlyCertificatesForClass(
    classId,
    className,
    academicYearStart,
  );

  const withResults = certificates.filter((cert) => cert.rows.length > 0);
  if (withResults.length === 0) {
    throw new Error("NO_CERTIFICATE_DATA");
  }

  const issuedDate = new Date().toLocaleDateString();
  const html = buildYearlyClassCertificatesHtml(
    schoolName,
    withResults,
    labels,
    issuedDate,
  );

  const fileName = `yearly-results-${className}-${formatAcademicYear(academicYearStart)}.pdf`;
  await shareHtmlAsPdf(html, fileName, labels.documentTitle);
  return withResults.length;
}

export function getPdfShareErrorKey(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === "PDF_SHARING_UNAVAILABLE") return "certificates.shareUnavailable";
    if (err.message === "PDF_CACHE_UNAVAILABLE") return "certificates.shareUnavailable";
    if (err.message === "NO_CERTIFICATE_DATA") return "certificates.noData";
  }
  return "certificates.exportFailed";
}
