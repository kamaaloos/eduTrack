/** Academic year starts in August (month index 7). */
export function getAcademicYearStart(date = new Date()): number {
  return date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1;
}

export function formatAcademicYear(startYear: number): string {
  return `${startYear}-${startYear + 1}`;
}

export function listAcademicYearStarts(count = 4): number[] {
  const current = getAcademicYearStart();
  return Array.from({ length: count }, (_, index) => current - index);
}

function parseExamDateLabel(dateLabel?: string): Date | null {
  if (!dateLabel?.trim()) return null;
  const parsed = new Date(dateLabel.trim());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Include exams without a date; otherwise match academic year start. */
export function examDateInAcademicYear(
  dateLabel: string | undefined,
  academicYearStart: number,
): boolean {
  const parsed = parseExamDateLabel(dateLabel);
  if (!parsed) return true;
  return getAcademicYearStart(parsed) === academicYearStart;
}
