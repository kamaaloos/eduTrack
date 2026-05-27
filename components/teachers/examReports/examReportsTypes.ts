export type ClassExam = {
  id: string;
  subject?: string;
  title?: string;
  date?: string;
  marks?: number;
};

export type ExamReportsMode = "grade" | "reports";

export const EXAM_REPORTS_STUDENTS_PAGE_SIZE = 5;
