import type { ReportCardData } from "../services/reportCardEngine";

export type GradeDisplay = {
  gradeAverage: string;
  gradeSummary: string;
};

export type GradeDisplayLabels = {
  emptySummary: string;
  subjectsSummary: (grade: string, count: number) => string;
  examsSummary: (grade: string, count: number) => string;
};

export function buildGradeDisplayFromReport(
  report: ReportCardData,
  labels: GradeDisplayLabels = {
    emptySummary: "No grades recorded yet",
    subjectsSummary: (grade, count) =>
      `Overall ${grade} · ${count} subject grade(s)`,
    examsSummary: (grade, count) =>
      `Overall ${grade} · ${count} graded exam(s)`,
  },
): GradeDisplay {
  if (report.subjects.length > 0) {
    return {
      gradeAverage: `${report.average}%`,
      gradeSummary: labels.subjectsSummary(report.grade, report.subjects.length),
    };
  }

  const gradedExams = report.exams.filter(
    (e) => e.graded && e.score != null && Number.isFinite(e.score),
  );

  if (gradedExams.length > 0) {
    const percentScores = gradedExams.map((e) => {
      const score = Number(e.score);
      if (e.maxMarks != null && e.maxMarks > 0) {
        return (score / e.maxMarks) * 100;
      }
      return score;
    });
    const avg =
      percentScores.reduce((sum, n) => sum + n, 0) / percentScores.length;
    const letter =
      avg >= 90 ? "A" : avg >= 80 ? "B" : avg >= 70 ? "C" : avg >= 60 ? "D" : "F";

    return {
      gradeAverage: `${avg.toFixed(1)}%`,
      gradeSummary: labels.examsSummary(letter, gradedExams.length),
    };
  }

  return {
    gradeAverage: "—",
    gradeSummary: labels.emptySummary,
  };
}

export function extractRemarkText(remark: Record<string, unknown> | undefined): string {
  if (!remark) return "";
  const candidates = [
    remark.text,
    remark.remark,
    remark.message,
    remark.content,
    remark.body,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return "";
}
