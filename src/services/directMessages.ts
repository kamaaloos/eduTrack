import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { notifyDirectMessage } from "./notificationEvents";
import { db } from "./firebase";

export type DirectMessageRecipientRole = "student" | "parent";

export type SendDirectMessageParams = {
  classId: string;
  studentId: string;
  studentName?: string;
  recipientRole: DirectMessageRecipientRole;
  recipientUserId: string;
  title: string;
  text: string;
  senderRole: "admin" | "teacher";
  senderId?: string;
  senderName?: string;
};

export async function sendDirectMessage(
  params: SendDirectMessageParams,
): Promise<void> {
  const classId = params.classId.trim();
  const studentId = params.studentId.trim();
  const recipientUserId = params.recipientUserId.trim();
  const title = params.title.trim();
  const text = params.text.trim();

  if (!classId || !studentId || !recipientUserId) {
    throw new Error("Class, student, and recipient are required");
  }
  if (!title || !text) {
    throw new Error("Title and message are required");
  }
  if (params.recipientRole !== "student" && params.recipientRole !== "parent") {
    throw new Error("Invalid recipient role");
  }

  await addDoc(collection(db, "classes", classId, "announcements"), {
    title,
    text,
    message: text,
    icon: "✉️",
    classId,
    direct: true,
    targetRole: params.recipientRole,
    targetUserId: recipientUserId,
    studentId,
    studentName: params.studentName?.trim() || null,
    senderRole: params.senderRole,
    senderId: params.senderId ?? null,
    senderName: params.senderName ?? null,
    createdAt: serverTimestamp(),
  });

  await notifyDirectMessage({
    classId,
    title,
    message: text.slice(0, 160),
    targetRole: params.recipientRole,
    targetUserId: recipientUserId,
    studentId,
    actorId: params.senderId ?? null,
  });
}
