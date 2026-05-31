import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  query,
  type Firestore,
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
  schoolDb: Firestore,
  collectionPath: string,
  ...constraints: QueryConstraint[]
): Promise<number> {
  try {
    const q =
      constraints.length > 0
        ? query(collection(schoolDb, collectionPath), ...constraints)
        : collection(schoolDb, collectionPath);
    const snap = await getCountFromServer(q);
    return snap.data().count;
  } catch (err) {
    console.warn(`countCollection ${collectionPath}:`, err);
    return 0;
  }
}

async function countUsersByRole(
  schoolDb: Firestore,
  role: string,
): Promise<number> {
  return countCollection(schoolDb, "users", where("role", "==", role));
}

async function countSubcollection(
  schoolDb: Firestore,
  classId: string,
  sub: "homework" | "exams" | "remarks" | "announcements",
): Promise<number> {
  try {
    const snap = await getCountFromServer(
      collection(schoolDb, "classes", classId, sub),
    );
    return snap.data().count;
  } catch {
    return 0;
  }
}

export function emptyAdminAnalytics(): AdminAnalyticsStats {
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
export async function loadAdminAnalyticsForDb(
  schoolDb: Firestore,
): Promise<AdminAnalyticsStats> {
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
    countUsersByRole(schoolDb, "student"),
    countUsersByRole(schoolDb, "teacher"),
    countUsersByRole(schoolDb, "parent"),
    countUsersByRole(schoolDb, "admin"),
    getDocs(collection(schoolDb, "classes")),
    countAdminAttendanceSummary(schoolDb),
    countCollection(schoolDb, "studentClasses"),
    countCollection(schoolDb, "teacherClasses"),
    countCollection(schoolDb, "homeworks"),
    countCollection(schoolDb, "exams"),
    countCollection(schoolDb, "remarks"),
    countCollection(schoolDb, "messages"),
    countCollection(schoolDb, "announcements"),
    getDocs(query(collection(schoolDb, "grades"), limit(GRADE_SAMPLE_LIMIT))),
    getDocs(
      query(collection(schoolDb, "examResults"), limit(GRADE_SAMPLE_LIMIT)),
    ),
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
          countSubcollection(schoolDb, classId, "homework"),
          countSubcollection(schoolDb, classId, "exams"),
          countSubcollection(schoolDb, classId, "remarks"),
          countSubcollection(schoolDb, classId, "announcements"),
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

export async function loadAdminAnalytics(): Promise<AdminAnalyticsStats> {
  if (!db) {
    return emptyAdminAnalytics();
  }
  return loadAdminAnalyticsForDb(db);
}

/** Bar chart values must be > 0 for react-native-chart-kit; use 0.01 floor for display. */
export function chartValues(values: number[]): number[] {
  return values.map((v) => (v > 0 ? v : 0.01));
}
