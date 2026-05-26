import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

export type NotificationRole = "student" | "parent" | "teacher";

export type NotificationType =
  | "homework_published"
  | "exam_published"
  | "announcement"
  | "remark"
  | "attendance_absent"
  | "attendance_late"
  | "grade_posted"
  | "parent_absence_report"
  | "parent_attendance_response";

export type CreateNotificationInput = {
  title: string;
  message: string;
  type: NotificationType;
  targetRole: NotificationRole;
  targetUserId: string;
  studentId?: string | null;
  classId?: string | null;
  actorId?: string | null;
};

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  targetRole: NotificationRole;
  targetUserId: string;
  studentId: string | null;
  classId: string | null;
  actorId: string | null;
  read: boolean;
  createdAt: Date | null;
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  homework_published: "Homework",
  exam_published: "Exam",
  announcement: "Announcement",
  remark: "Remark",
  attendance_absent: "Absence",
  attendance_late: "Late",
  grade_posted: "Grade",
  parent_absence_report: "Absence report",
  parent_attendance_response: "Attendance reply",
};

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "object" && value !== null && "seconds" in value) {
    return new Date((value as { seconds: number }).seconds * 1000);
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function mapNotificationDoc(
  id: string,
  data: Record<string, unknown>,
): AppNotification {
  return {
    id,
    title: String(data.title ?? ""),
    message: String(data.message ?? ""),
    type: (data.type as NotificationType) ?? "announcement",
    targetRole: (data.targetRole as NotificationRole) ?? "student",
    targetUserId: String(data.targetUserId ?? ""),
    studentId: (data.studentId as string) || null,
    classId: (data.classId as string) || null,
    actorId: (data.actorId as string) || null,
    read: Boolean(data.read),
    createdAt: toDate(data.createdAt),
  };
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<string | null> {
  if (!db || !input.targetUserId) return null;

  try {
    const ref = await addDoc(collection(db, "notifications"), {
      title: input.title,
      message: input.message,
      type: input.type,
      targetRole: input.targetRole,
      targetUserId: input.targetUserId,
      studentId: input.studentId ?? null,
      classId: input.classId ?? null,
      actorId: input.actorId ?? null,
      read: false,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.warn("createNotification failed:", err);
    return null;
  }
}

export async function createNotifications(
  inputs: CreateNotificationInput[],
): Promise<void> {
  if (!db || inputs.length === 0) return;

  const chunkSize = 400;
  for (let i = 0; i < inputs.length; i += chunkSize) {
    const chunk = inputs.slice(i, i + chunkSize);
    try {
      const batch = writeBatch(db);
      chunk.forEach((input) => {
        const ref = doc(collection(db, "notifications"));
        batch.set(ref, {
          title: input.title,
          message: input.message,
          type: input.type,
          targetRole: input.targetRole,
          targetUserId: input.targetUserId,
          studentId: input.studentId ?? null,
          classId: input.classId ?? null,
          actorId: input.actorId ?? null,
          read: false,
          createdAt: serverTimestamp(),
        });
      });
      await batch.commit();
    } catch (err) {
      console.warn("createNotifications batch failed:", err);
    }
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "notifications", notificationId), { read: true });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (!db) return;

  const snap = await getDocs(
    query(
      collection(db, "notifications"),
      where("targetUserId", "==", userId),
      where("read", "==", false),
    ),
  );

  if (snap.empty) return;

  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    batch.update(d.ref, { read: true });
  });
  await batch.commit();
}

/** @deprecated Use createNotification instead */
export const sendNotification = createNotification;
