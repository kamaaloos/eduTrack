export type FirestoreTimestampLike =
  | { toDate: () => Date }
  | { seconds: number }
  | string
  | number
  | Date
  | null
  | undefined;

export function parseFirestoreDate(
  value: FirestoreTimestampLike,
): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "object" && value !== null && "seconds" in value) {
    return new Date((value as { seconds: number }).seconds * 1000);
  }
  const parsed = new Date(value as string | number);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function normalizeSubject(item: { subject?: string }): string {
  return (item.subject || "General").trim() || "General";
}

export function getHomeworkDueDate(item: {
  daysLeft?: number;
  dueDate?: FirestoreTimestampLike;
  createdAt?: FirestoreTimestampLike;
}): Date | null {
  const explicit = parseFirestoreDate(item.dueDate);
  if (explicit) return explicit;

  const created = parseFirestoreDate(item.createdAt);
  const span = Number(item.daysLeft);
  if (created && Number.isFinite(span) && span > 0) {
    const due = new Date(created);
    due.setDate(due.getDate() + span);
    return due;
  }

  return null;
}

export function getHomeworkDaysLeft(
  item: {
    daysLeft?: number;
    dueDate?: FirestoreTimestampLike;
    createdAt?: FirestoreTimestampLike;
  },
  now: Date = new Date(),
): number {
  const due = getHomeworkDueDate(item);
  if (!due) return 0;

  const diffMs = endOfDay(due).getTime() - startOfDay(now).getTime();
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

export function isHomeworkActive(
  item: {
    daysLeft?: number;
    dueDate?: FirestoreTimestampLike;
    createdAt?: FirestoreTimestampLike;
  },
  now: Date = new Date(),
): boolean {
  return getHomeworkDaysLeft(item, now) > 0;
}

export type HomeworkSlide =
  | { kind: "assignment"; item: Record<string, unknown>; daysLeft: number }
  | { kind: "empty-all" };

export function buildHomeworkSlides(
  homework: Record<string, unknown>[],
  now: Date = new Date(),
): HomeworkSlide[] {
  const active = homework.filter((h) =>
    isHomeworkActive(
      h as {
        daysLeft?: number;
        dueDate?: FirestoreTimestampLike;
        createdAt?: FirestoreTimestampLike;
      },
      now,
    ),
  );

  if (active.length === 0) {
    return [{ kind: "empty-all" }];
  }

  return active.map((item) => ({
    kind: "assignment" as const,
    item,
    daysLeft: getHomeworkDaysLeft(
      item as {
        daysLeft?: number;
        dueDate?: FirestoreTimestampLike;
        createdAt?: FirestoreTimestampLike;
      },
      now,
    ),
  }));
}

export function parseExamDateString(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const iso = /^\d{4}-\d{2}-\d{2}/.exec(trimmed);
  if (iso) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const dmy = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/.exec(trimmed);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]) - 1;
    let year = Number(dmy[3]);
    if (year < 100) year += 2000;
    const parsed = new Date(year, month, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isExamPast(
  exam: {
    status?: string;
    done?: boolean;
    date?: string;
    examDate?: FirestoreTimestampLike;
    title?: string;
  },
  now: Date = new Date(),
): boolean {
  const status = (exam.status || "").toLowerCase();
  if (status === "completed" || status === "done" || status === "finished") {
    return true;
  }
  if (exam.done === true) return true;

  const dateFromTs = parseFirestoreDate(exam.examDate);
  if (dateFromTs && endOfDay(dateFromTs) < startOfDay(now)) return true;

  const dateStr = exam.date || "";
  const parsed = parseExamDateString(dateStr);
  if (parsed && endOfDay(parsed) < startOfDay(now)) return true;

  return false;
}

export function filterUpcomingExams<T extends Record<string, unknown>>(
  exams: T[],
  now: Date = new Date(),
  gradedExamIds: ReadonlySet<string> = new Set(),
): T[] {
  return exams.filter((e) => {
    const id = String(e.id ?? "");
    if (id && gradedExamIds.has(id)) return false;
    return !isExamPast(e as Parameters<typeof isExamPast>[0], now);
  });
}
