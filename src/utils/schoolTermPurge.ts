/** Root collections removed when a school term ends. */
export const SCHOOL_TERM_ROOT_COLLECTIONS = [
  "attendance",
  "homeworks",
  "exams",
  "remarks",
  "announcements",
  "messages",
  "grades",
  "examResults",
  "notifications",
  "parentRemarks",
  "parentComplaints",
  "timetables",
] as const;

/** Per-class subcollections cleared for each class document. */
export const SCHOOL_TERM_CLASS_SUBCOLLECTIONS = [
  "homework",
  "exams",
  "remarks",
  "announcements",
  "schedules",
] as const;

export type SchoolTermRootCollection = (typeof SCHOOL_TERM_ROOT_COLLECTIONS)[number];
export type SchoolTermClassSubcollection =
  (typeof SCHOOL_TERM_CLASS_SUBCOLLECTIONS)[number];

export function emptySchoolTermPurgeCounts() {
  return {
    attendance: 0,
    homework: 0,
    exams: 0,
    remarks: 0,
    announcements: 0,
    grades: 0,
    examResults: 0,
    notifications: 0,
    parentRemarks: 0,
    schedules: 0,
    parentComplaints: 0,
    legacyRoot: 0,
  };
}

/** Map root collection id to purge count bucket. */
export function purgeCountKeyForRootCollection(
  name: SchoolTermRootCollection,
): keyof ReturnType<typeof emptySchoolTermPurgeCounts> {
  switch (name) {
    case "attendance":
      return "attendance";
    case "homeworks":
      return "homework";
    case "exams":
      return "exams";
    case "remarks":
      return "remarks";
    case "announcements":
    case "messages":
      return "announcements";
    case "grades":
      return "grades";
    case "examResults":
      return "examResults";
    case "notifications":
      return "notifications";
    case "parentRemarks":
      return "parentRemarks";
    case "parentComplaints":
      return "parentComplaints";
    case "timetables":
      return "schedules";
    default:
      return "legacyRoot";
  }
}
