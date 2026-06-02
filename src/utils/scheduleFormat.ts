import type { TFunction } from "i18next";

export const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

/** Localized weekday name for dashboard headers and empty states. */
export function getWeekdayLabel(t: TFunction, key: WeekdayKey): string {
  const translated = t(`weekdays.${key}`);
  return translated !== `weekdays.${key}` ? translated : WEEKDAY_LABELS[key];
}

export function getTodayDayKey(): WeekdayKey {
  return WEEKDAY_KEYS[new Date().getDay()];
}

const DAY_ALIASES: Record<string, WeekdayKey> = {
  sun: "sunday",
  sunday: "sunday",
  mon: "monday",
  monday: "monday",
  tue: "tuesday",
  tuesday: "tuesday",
  wed: "wednesday",
  wednesday: "wednesday",
  thu: "thursday",
  thursday: "thursday",
  fri: "friday",
  friday: "friday",
  sat: "saturday",
  saturday: "saturday",
};

/** Parse Excel / import day column to a weekday key. */
export function parseDayOfWeek(raw: string): WeekdayKey | null {
  const key = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (!key) return null;
  return DAY_ALIASES[key] ?? null;
}

/** e.g. "Mohammed" → "Moh", "Cal" → "Cal" */
export function teacherInitials(teacherName: string): string {
  const trimmed = teacherName.trim();
  if (!trimmed) return "";
  const first = trimmed.split(/\s+/)[0];
  if (first.length <= 3) return first;
  return first.slice(0, 3);
}

export type ScheduleSlot = {
  id?: string;
  startTime?: string;
  endTime?: string;
  subject?: string;
  teacherName?: string;
  time?: string;
  room?: string;
  dayOfWeek?: string;
  sortOrder?: number;
};

function formatScheduleDisplayDate(day: WeekdayKey): string {
  const now = new Date();
  if (day === getTodayDayKey()) {
    return now.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
  return WEEKDAY_LABELS[day];
}

/** Line 1: Wed, May 20 · 08:15 - 09:45 */
export function scheduleDateTimeLine(
  slot: ScheduleSlot,
  dayKey?: WeekdayKey,
): string {
  const day =
    dayKey ||
    ((slot.dayOfWeek as WeekdayKey | undefined) ?? getTodayDayKey());
  const datePart = formatScheduleDisplayDate(day);

  if (slot.startTime && slot.endTime) {
    return `${datePart} · ${slot.startTime} - ${slot.endTime}`;
  }

  if (slot.time) {
    return `${datePart} · ${slot.time}`;
  }

  return datePart;
}

/** Line 2: Math / Moh */
export function scheduleSubjectTeacherLine(slot: ScheduleSlot): string {
  const subject = (slot.subject || "Lesson").trim();
  const teacher = teacherInitials(slot.teacherName || "");
  if (teacher) return `${subject} / ${teacher}`;
  return subject;
}

/** Single-line fallback (admin lists, etc.) */
export function formatScheduleLine(slot: ScheduleSlot): string {
  return `${scheduleDateTimeLine(slot)} — ${scheduleSubjectTeacherLine(slot)}`;
}

export function compareScheduleSlots(a: ScheduleSlot, b: ScheduleSlot): number {
  const orderA = a.sortOrder ?? 999;
  const orderB = b.sortOrder ?? 999;
  if (orderA !== orderB) return orderA - orderB;
  return (a.startTime || "").localeCompare(b.startTime || "");
}

export function filterSchedulesForDay(
  slots: ScheduleSlot[],
  dayKey: WeekdayKey,
): ScheduleSlot[] {
  return slots
    .filter((s) => {
      const day = (s.dayOfWeek as WeekdayKey | undefined) || "monday";
      return day === dayKey;
    })
    .sort(compareScheduleSlots);
}

function slotDayKey(slot: ScheduleSlot): WeekdayKey {
  return parseDayOfWeek(slot.dayOfWeek || "") ?? "monday";
}

function weekdayDistanceFromToday(
  day: WeekdayKey,
  date: Date = new Date(),
): number {
  const today = date.getDay();
  const target = WEEKDAY_KEYS.indexOf(day);
  return (target - today + 7) % 7;
}

/** Minutes since midnight from "08:15" */
export function parseHHmmToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export function formatTimeHHmm(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function normalizeTimeHHmm(value: string, fallback = "08:00"): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const minutes = parseHHmmToMinutes(trimmed);
  if (minutes == null) return fallback;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getNowMinutes(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

function slotEndMinutes(slot: ScheduleSlot): number | null {
  const end = parseHHmmToMinutes(slot.endTime || "");
  if (end != null) return end;
  const start = parseHHmmToMinutes(slot.startTime || slot.time || "");
  if (start != null) return start + 45;
  return null;
}

function slotStartMinutes(slot: ScheduleSlot): number | null {
  const start = parseHHmmToMinutes(slot.startTime || "");
  if (start != null) return start;
  return parseHHmmToMinutes(slot.time || "");
}

/** Period is over once end time is reached */
export function isScheduleSlotEnded(
  slot: ScheduleSlot,
  date: Date = new Date(),
): boolean {
  const end = slotEndMinutes(slot);
  if (end == null) return false;
  return getNowMinutes(date) >= end;
}

/** Active during [start, end) */
export function isScheduleSlotCurrent(
  slot: ScheduleSlot,
  date: Date = new Date(),
): boolean {
  const start = slotStartMinutes(slot);
  const end = slotEndMinutes(slot);
  if (start == null || end == null) return false;
  const now = getNowMinutes(date);
  return now >= start && now < end;
}

/** Upcoming + in-progress; hides finished periods */
export function filterUpcomingScheduleSlots(
  slots: ScheduleSlot[],
  date: Date = new Date(),
): ScheduleSlot[] {
  return slots.filter((s) => !isScheduleSlotEnded(s, date));
}

/**
 * Weekly order starting from today; hides periods that already ended today.
 * If today is over, tomorrow naturally becomes first.
 */
export function orderUpcomingWeeklyScheduleSlots(
  slots: ScheduleSlot[],
  date: Date = new Date(),
): ScheduleSlot[] {
  return [...slots]
    .filter((slot) => {
      const day = slotDayKey(slot);
      if (day !== getTodayDayKey()) return true;
      return !isScheduleSlotEnded(slot, date);
    })
    .sort((a, b) => {
      const dayA = slotDayKey(a);
      const dayB = slotDayKey(b);
      const distA = weekdayDistanceFromToday(dayA, date);
      const distB = weekdayDistanceFromToday(dayB, date);
      if (distA !== distB) return distA - distB;
      return compareScheduleSlots(a, b);
    });
}

export function findCurrentScheduleSlotId(
  slots: ScheduleSlot[],
  date: Date = new Date(),
): string | undefined {
  return slots.find((s) => isScheduleSlotCurrent(s, date))?.id;
}

/** Current active slot from today's periods only. */
export function findCurrentTodayScheduleSlotId(
  slots: ScheduleSlot[],
  date: Date = new Date(),
): string | undefined {
  const today = getTodayDayKey();
  return slots.find((s) => slotDayKey(s) === today && isScheduleSlotCurrent(s, date))
    ?.id;
}
