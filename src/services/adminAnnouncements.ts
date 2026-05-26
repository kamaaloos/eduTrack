import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type BroadcastAnnouncementParams = {
  title: string;
  text: string;
  adminId?: string;
  adminName?: string;
};

export type BroadcastAnnouncementResult = {
  classCount: number;
  published: number;
  failed: number;
  errors: string[];
};

export async function publishAnnouncementToAllClasses(
  params: BroadcastAnnouncementParams,
): Promise<BroadcastAnnouncementResult> {
  const title = params.title.trim();
  const text = params.text.trim();

  if (!title || !text) {
    throw new Error("Title and message are required");
  }

  const classesSnap = await getDocs(collection(db, "classes"));
  const classIds = classesSnap.docs.map((d) => d.id);

  if (classIds.length === 0) {
    throw new Error("No classes found. Create classes before broadcasting.");
  }

  const errors: string[] = [];
  let published = 0;

  await Promise.all(
    classIds.map(async (classId) => {
      try {
        await addDoc(collection(db, "classes", classId, "announcements"), {
          title,
          text,
          message: text,
          icon: "📢",
          classId,
          broadcast: true,
          senderRole: "admin",
          senderId: params.adminId ?? null,
          senderName: params.adminName ?? "Admin",
          createdAt: serverTimestamp(),
        });
        published++;
      } catch (err) {
        const className =
          (classesSnap.docs.find((d) => d.id === classId)?.data().name as
            | string
            | undefined) ?? classId;
        errors.push(
          `${className}: ${err instanceof Error ? err.message : "failed"}`,
        );
      }
    }),
  );

  return {
    classCount: classIds.length,
    published,
    failed: classIds.length - published,
    errors,
  };
}
