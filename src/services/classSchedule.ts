import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  compareScheduleSlots,
  type ScheduleSlot,
  type WeekdayKey,
} from "../utils/scheduleFormat";

export type ClassScheduleEntry = ScheduleSlot & {
  id: string;
  classId: string;
  dayOfWeek: WeekdayKey;
};

export async function loadClassScheduleForDay(
  classId: string,
  dayOfWeek: WeekdayKey,
): Promise<ClassScheduleEntry[]> {
  const snap = await getDocs(collection(db, "classes", classId, "schedules"));

  const entries = snap.docs
    .map((d) => ({
      id: d.id,
      classId,
      ...(d.data() as ScheduleSlot),
      dayOfWeek: (d.data().dayOfWeek as WeekdayKey) || "monday",
    }))
    .filter((e) => e.dayOfWeek === dayOfWeek) as ClassScheduleEntry[];

  return entries.sort(compareScheduleSlots);
}

export async function addClassScheduleSlot(params: {
  classId: string;
  dayOfWeek: WeekdayKey;
  startTime: string;
  endTime: string;
  subject: string;
  teacherName: string;
  sortOrder?: number;
}): Promise<string> {
  const ref = await addDoc(
    collection(db, "classes", params.classId, "schedules"),
    {
      classId: params.classId,
      dayOfWeek: params.dayOfWeek,
      startTime: params.startTime.trim(),
      endTime: params.endTime.trim(),
      subject: params.subject.trim(),
      teacherName: params.teacherName.trim(),
      sortOrder: params.sortOrder ?? 0,
      createdAt: serverTimestamp(),
    },
  );
  return ref.id;
}

export async function deleteClassScheduleSlot(
  classId: string,
  scheduleId: string,
): Promise<void> {
  await deleteDoc(doc(db, "classes", classId, "schedules", scheduleId));
}
