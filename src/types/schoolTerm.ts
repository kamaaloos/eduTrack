export type SchoolTermStatus = "active" | "between";

export type SchoolTermRecord = {
  status: SchoolTermStatus;
  /** Display label, e.g. 2025-2026 */
  label: string;
  startedAt: string;
  startedBy: string;
  endedAt?: string | null;
  endedBy?: string | null;
};

export type SchoolTermPurgeCounts = {
  attendance: number;
  homework: number;
  exams: number;
  remarks: number;
  announcements: number;
  grades: number;
  examResults: number;
  notifications: number;
  parentRemarks: number;
  schedules: number;
  parentComplaints: number;
  legacyRoot: number;
};

export type FinishSchoolTermResult = {
  term: SchoolTermRecord;
  deleted: SchoolTermPurgeCounts;
};
