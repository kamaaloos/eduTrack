import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  query,
  type QueryConstraint,
  where,
} from "firebase/firestore";
import { ATTENDANCE_HISTORY_DAYS } from "../constants/attendanceHistory";
import { countAdminAttendanceSummary } from "./attendanceQueries";
import { db } from "./firebase";

export type AdminAnalyticsStats = {
  students: number;
  teachers: number;
  parents: number;
  admins: number;
  classes: number;
  homeworks: number;
  exams: number;
  remarks: number;
  announcements: number;
  attendanceRecords: number;
  attendancePresent: number;
  attendanceRate: number;
  attendanceWindowDays: number;
  gradesCount: number;
  avgGrade: number;
  studentClassLinks: number;
  teacherClassLinks: number;
  gradesSampleSize: number;
};

const GRADE_SAMPLE_LIMIT = 800;

async function countCollection(
  collectionPath: string,
  ...constraints: QueryConstraint[]
): Promise<number> {
  if (!db) return 0;
  try {
    const q =
      constraints.length > 0
        ? query(collection(db, collectionPath), ...constraints)
        : collection(db, collectionPath);
    const snap = await getCountFromServer(q);
    return snap.data().count;
  } catch (err) {
    console.warn(`countCollection ${collectionPath}:`, err);
    return 0;
  }
}

async function countUsersByRole(role: string): Promise<number> {
  return countCollection("users", where("role", "==", role));
}

async function countSubcollection(
  classId: string,
  sub: "homework" | "exams" | "remarks" | "announcements",
): Promise<number> {
  if (!db) return 0;
  try {
    const snap = await getCountFromServer(
      collection(db, "classes", classId, sub),
    );
    return snap.data().count;
  } catch {
    return 0;
  }
}

function emptyAdminAnalytics(): AdminAnalyticsStats {
  return {
    students: 0,
    teachers: 0,
    parents: 0,
    admins: 0,
    classes: 0,
    homeworks: 0,
    exams: 0,
    remarks: 0,
    announcements: 0,
    attendanceRecords: 0,
    attendancePresent: 0,
    attendanceRate: 0,
    attendanceWindowDays: ATTENDANCE_HISTORY_DAYS,
    gradesCount: 0,
    avgGrade: 0,
    studentClassLinks: 0,
    teacherClassLinks: 0,
    gradesSampleSize: 0,
  };
}

/** Loads school-wide stats using count queries and bounded attendance/grade samples. */
export async function loadAdminAnalytics(): Promise<AdminAnalyticsStats> {
  if (!db) {
    return emptyAdminAnalytics();
  }

  const [
    students,
    teachers,
    parents,
    admins,
    classesSnap,
    attendanceSummary,
    studentClassLinks,
    teacherClassLinks,
    hwLegacy,
    examsLegacy,
    remarksLegacy,
    messagesLegacy,
    announcementsLegacy,
    gradeSample,
    examResultsSample,
  ] = await Promise.all([
    countUsersByRole("student"),
    countUsersByRole("teacher"),
    countUsersByRole("parent"),
    countUsersByRole("admin"),
    getDocs(collection(db, "classes")),
    countAdminAttendanceSummary(),
    countCollection("studentClasses"),
    countCollection("teacherClasses"),
    countCollection("homeworks"),
    countCollection("exams"),
    countCollection("remarks"),
    countCollection("messages"),
    countCollection("announcements"),
    getDocs(query(collection(db, "grades"), limit(GRADE_SAMPLE_LIMIT))),
    getDocs(query(collection(db, "examResults"), limit(GRADE_SAMPLE_LIMIT))),
  ]);

  const classIds = classesSnap.docs.map((d) => d.id);

  let homeworks = hwLegacy;
  let exams = examsLegacy;
  let remarks = remarksLegacy;
  let announcements = announcementsLegacy + messagesLegacy;

  const classBatchSize = 8;
  for (let i = 0; i < classIds.length; i += classBatchSize) {
    const batch = classIds.slice(i, i + classBatchSize);
    const counts = await Promise.all(
      batch.map(async (classId) => {
        const [hw, ex, rm, ann] = await Promise.all([
          countSubcollection(classId, "homework"),
          countSubcollection(classId, "exams"),
          countSubcollection(classId, "remarks"),
          countSubcollection(classId, "announcements"),
        ]);
        return { hw, ex, rm, ann };
      }),
    );
    for (const c of counts) {
      homeworks += c.hw;
      exams += c.ex;
      remarks += c.rm;
      announcements += c.ann;
    }
  }

  const gradeScores = gradeSample.docs
    .map((d) => d.data().score)
    .filter((s): s is number => typeof s === "number" && !Number.isNaN(s));

  const examScores = examResultsSample.docs
    .map((d) => d.data())
    .filter((r) => r.graded === true)
    .map((r) => {
      const score = Number(r.score);
      if (!Number.isFinite(score)) return null;
      const maxMarks = r.maxMarks != null ? Number(r.maxMarks) : null;
      if (maxMarks != null && maxMarks > 0) return (score / maxMarks) * 100;
      return score;
    })
    .filter((s): s is number => s != null);

  const allScores = [...gradeScores, ...examScores];
  const avgGrade =
    allScores.length > 0
      ? Number(
          (allScores.reduce((sum, s) => sum + s, 0) / allScores.length).toFixed(
            1,
          ),
        )
      : 0;

  return {
    students,
    teachers,
    parents,
    admins,
    classes: classIds.length,
    homeworks,
    exams,
    remarks,
    announcements,
    attendanceRecords: attendanceSummary.total,
    attendancePresent: attendanceSummary.present,
    attendanceRate: attendanceSummary.rate ?? 0,
    attendanceWindowDays: ATTENDANCE_HISTORY_DAYS,
    gradesCount: allScores.length,
    avgGrade,
    studentClassLinks,
    teacherClassLinks,
    gradesSampleSize: allScores.length,
  };
}

/** Bar chart values must be > 0 for react-native-chart-kit; use 0.01 floor for display. */
export function chartValues(values: number[]): number[] {
  return values.map((v) => (v > 0 ? v : 0.01));
}
