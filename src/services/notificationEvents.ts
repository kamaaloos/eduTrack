import type { CreateNotificationInput } from "./notifications";
import { createNotifications } from "./notifications";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  getParentIdsForStudents,
  getStudentIdsInClass,
  getTeacherIdsForClass,
} from "./notificationTargets";

async function notifyStudentsAndParentsInClass(params: {
  classId: string;
  title: string;
  message: string;
  type: CreateNotificationInput["type"];
  actorId?: string | null;
  studentIds?: string[];
  onlyStudentId?: string;
}): Promise<void> {
  const studentIds =
    params.onlyStudentId != null
      ? [params.onlyStudentId]
      : params.studentIds ?? (await getStudentIdsInClass(params.classId));

  if (studentIds.length === 0) return;

  const parentsByStudent = await getParentIdsForStudents(studentIds);
  const inputs: CreateNotificationInput[] = [];

  for (const studentId of studentIds) {
    inputs.push({
      title: params.title,
      message: params.message,
      type: params.type,
      targetRole: "student",
      targetUserId: studentId,
      studentId,
      classId: params.classId,
      actorId: params.actorId ?? null,
    });

    const parentIds = parentsByStudent.get(studentId) ?? [];
    for (const parentId of parentIds) {
      inputs.push({
        title: params.title,
        message: params.message,
        type: params.type,
        targetRole: "parent",
        targetUserId: parentId,
        studentId,
        classId: params.classId,
        actorId: params.actorId ?? null,
      });
    }
  }

  await createNotifications(inputs);
}

async function notifyTeachersInClass(params: {
  classId: string;
  title: string;
  message: string;
  type: CreateNotificationInput["type"];
  studentId?: string | null;
  actorId?: string | null;
}): Promise<void> {
  const teacherIds = await getTeacherIdsForClass(params.classId);
  if (teacherIds.length === 0) return;

  await createNotifications(
    teacherIds.map((teacherId) => ({
      title: params.title,
      message: params.message,
      type: params.type,
      targetRole: "teacher",
      targetUserId: teacherId,
      studentId: params.studentId ?? null,
      classId: params.classId,
      actorId: params.actorId ?? null,
    })),
  );
}

export async function notifyHomeworkPublished(params: {
  classId: string;
  title: string;
  subject: string;
  teacherName?: string;
  actorId?: string | null;
}): Promise<void> {
  const by = params.teacherName ? ` by ${params.teacherName}` : "";
  await notifyStudentsAndParentsInClass({
    classId: params.classId,
    title: "New homework",
    message: `${params.subject}: ${params.title}${by}`,
    type: "homework_published",
    actorId: params.actorId,
  });
}

export async function notifyExamPublished(params: {
  classId: string;
  title: string;
  subject: string;
  actorId?: string | null;
}): Promise<void> {
  await notifyStudentsAndParentsInClass({
    classId: params.classId,
    title: "New exam scheduled",
    message: `${params.subject}: ${params.title}`,
    type: "exam_published",
    actorId: params.actorId,
  });
}

export async function notifyAnnouncementPublished(params: {
  classId: string;
  title: string;
  preview: string;
  actorId?: string | null;
}): Promise<void> {
  await notifyStudentsAndParentsInClass({
    classId: params.classId,
    title: params.title || "New announcement",
    message: params.preview,
    type: "announcement",
    actorId: params.actorId,
  });
}

export async function notifyRemarkPublished(params: {
  classId: string;
  studentId: string;
  studentName: string;
  preview: string;
  actorId?: string | null;
}): Promise<void> {
  await notifyStudentsAndParentsInClass({
    classId: params.classId,
    title: `Remark for ${params.studentName}`,
    message: params.preview,
    type: "remark",
    actorId: params.actorId,
    onlyStudentId: params.studentId,
  });
}

export async function notifyAttendanceMarked(params: {
  classId: string;
  studentId: string;
  studentName: string;
  status: "absent" | "late";
  date: string;
  actorId?: string | null;
}): Promise<void> {
  const isAbsent = params.status === "absent";
  await notifyStudentsAndParentsInClass({
    classId: params.classId,
    title: isAbsent ? "Marked absent" : "Marked late",
    message: `${params.studentName} was marked ${params.status} on ${params.date}.`,
    type: isAbsent ? "attendance_absent" : "attendance_late",
    actorId: params.actorId,
    onlyStudentId: params.studentId,
  });
}

export async function notifyGradePosted(params: {
  classId: string;
  studentId: string;
  studentName: string;
  subject: string;
  score: number;
  actorId?: string | null;
}): Promise<void> {
  await notifyStudentsAndParentsInClass({
    classId: params.classId,
    title: "Grade posted",
    message: `${params.studentName}: ${params.subject} — ${params.score}%`,
    type: "grade_posted",
    actorId: params.actorId,
    onlyStudentId: params.studentId,
  });
}

export async function notifyTeachersParentAbsenceReport(params: {
  classId: string;
  studentId: string;
  studentName: string;
  reason: string;
  parentId: string;
}): Promise<void> {
  await notifyTeachersInClass({
    classId: params.classId,
    title: "Parent absence report",
    message: `${params.studentName}: ${params.reason}`,
    type: "parent_absence_report",
    studentId: params.studentId,
    actorId: params.parentId,
  });
}

export async function notifyTeachersParentAttendanceResponse(params: {
  classId: string;
  studentId: string;
  studentName: string;
  reason: string;
  parentId: string;
}): Promise<void> {
  await notifyTeachersInClass({
    classId: params.classId,
    title: "Parent explained absence",
    message: `${params.studentName}: ${params.reason}`,
    type: "parent_attendance_response",
    studentId: params.studentId,
    actorId: params.parentId,
  });
}

export async function notifySchoolUsageExpiring(params: {
  schoolId: string;
  schoolName: string;
  remainingDays: number;
  actorId?: string | null;
}): Promise<void> {
  if (!db) return;

  // Avoid creating duplicate warnings frequently.
  const existing = await getDocs(
    query(
      collection(db, "notifications"),
      where("type", "==", "school_usage_expiring"),
    ),
  );
  const now = Date.now();
  const hasRecent = existing.docs.some((docSnap) => {
    const data = docSnap.data();
    if (data.classId !== params.schoolId) return false;
    const raw = data.createdAt as { toDate?: () => Date } | undefined;
    const createdAt = raw?.toDate?.();
    return createdAt ? now - createdAt.getTime() < 24 * 60 * 60 * 1000 : false;
  });
  if (hasRecent) return;

  const users = await getDocs(
    query(
      collection(db, "users"),
      where("role", "in", ["admin", "superAdmin"]),
    ),
  );
  if (users.empty) return;

  const title = "School usage expires soon";
  const message = `${params.schoolName}: ${params.remainingDays} day(s) remaining. Recharge fee-time soon.`;
  const inputs: CreateNotificationInput[] = users.docs.map((u) => ({
    title,
    message,
    type: "school_usage_expiring",
    targetRole:
      u.data().role === "superAdmin" ? "superAdmin" : "admin",
    targetUserId: u.id,
    classId: params.schoolId,
    actorId: params.actorId ?? null,
  }));
  await createNotifications(inputs);
}
