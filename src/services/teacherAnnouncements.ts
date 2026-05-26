import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export type TeacherAnnouncement = {
  id: string;
  classId: string;
  title?: string;
  text?: string;
  message?: string;
  createdAt?: unknown;
  [key: string]: unknown;
};

function toMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "object" && value !== null) {
    const ts = value as { toMillis?: () => number; seconds?: number };
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (typeof ts.seconds === "number") return ts.seconds * 1000;
  }
  if (value instanceof Date) return value.getTime();
  return 0;
}

/** Loads announcements from classes/{classId}/announcements for teacher-owned classes. */
export async function loadAnnouncementsForTeacher(
  classIds: string[],
): Promise<TeacherAnnouncement[]> {
  if (classIds.length === 0) return [];

  const results: TeacherAnnouncement[] = [];

  await Promise.all(
    classIds.map(async (classId) => {
      try {
        const snap = await getDocs(
          collection(db, "classes", classId, "announcements"),
        );

        snap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          results.push({
            id: docSnap.id,
            classId,
            title: data.title as string | undefined,
            text: (data.text as string) || (data.message as string),
            message: data.message as string | undefined,
            createdAt: data.createdAt,
            ...data,
          });
        });
      } catch (err) {
        console.warn("announcements query failed for class", classId, err);
      }
    }),
  );

  return results.sort(
    (a, b) => toMillis(b.createdAt) - toMillis(a.createdAt),
  );
}
