import type { ReportCardData } from "../services/reportCardEngine";

export type GradeDisplay = {
  gradeAverage: string;
  gradeSummary: string;
};

export function buildGradeDisplayFromReport(
  report: ReportCardData,
  emptySummary = "No grades recorded yet",
): GradeDisplay {
  if (report.subjects.length > 0) {
    return {
      gradeAverage: `${report.average}%`,
      gradeSummary: `Overall ${report.grade} · ${report.subjects.length} subject grade(s)`,
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
      gradeSummary: `Overall ${letter} · ${gradedExams.length} graded exam(s)`,
    };
  }

  return {
    gradeAverage: "—",
    gradeSummary: emptySummary,
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
