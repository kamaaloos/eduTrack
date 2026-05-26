/** Default window for attendance lists, rates, and admin attendance stats. */
export const ATTENDANCE_HISTORY_DAYS = 90;

/** ISO date string (YYYY-MM-DD) for the first day included in history queries. */
export function getAttendanceHistorySinceDate(
  days: number = ATTENDANCE_HISTORY_DAYS,
): string {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days);
  return start.toISOString().split("T")[0];
}

export function attendanceHistoryLabel(
  days: number = ATTENDANCE_HISTORY_DAYS,
): string {
  return `Last ${days} days`;
}
