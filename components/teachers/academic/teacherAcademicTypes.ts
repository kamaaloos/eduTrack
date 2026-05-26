export const ACADEMIC_TABS = [
  "homework",
  "exams",
  "remarks",
  "announcements",
] as const;

export type AcademicTab = (typeof ACADEMIC_TABS)[number];
