export type ClassExam = {
  id: string;
  subject?: string;
  title?: string;
  date?: string;
  marks?: number;
};

export type ExamReportsMode = "grade" | "reports";

export const EXAM_REPORTS_STUDENTS_PAGE_SIZE = 4;

/** iOS numeric keyboard accessory — shared by score + search inputs on this screen. */
export const EXAM_REPORTS_KEYBOARD_ACCESSORY_ID = "exam-reports-keyboard-done";
