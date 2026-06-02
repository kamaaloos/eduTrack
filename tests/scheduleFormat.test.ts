import {
  formatTimeHHmm,
  orderUpcomingWeeklyScheduleSlots,
  normalizeTimeHHmm,
  parseDayOfWeek,
  parseHHmmToMinutes,
  scheduleSubjectTeacherLine,
} from "../src/utils/scheduleFormat";

describe("scheduleFormat time helpers", () => {
  it("parses HH:mm to minutes", () => {
    expect(parseHHmmToMinutes("08:15")).toBe(8 * 60 + 15);
    expect(parseHHmmToMinutes("23:59")).toBe(23 * 60 + 59);
    expect(parseHHmmToMinutes("invalid")).toBeNull();
  });

  it("formats Date as HH:mm", () => {
    const date = new Date();
    date.setHours(9, 5, 0, 0);
    expect(formatTimeHHmm(date)).toBe("09:05");
  });

  it("normalizes time strings", () => {
    expect(normalizeTimeHHmm("08:05")).toBe("08:05");
    expect(normalizeTimeHHmm("8:05")).toBe("08:05");
    expect(normalizeTimeHHmm("")).toBe("08:00");
    expect(normalizeTimeHHmm("bad", "09:30")).toBe("09:30");
  });
});

describe("parseDayOfWeek", () => {
  it("accepts full and short day names", () => {
    expect(parseDayOfWeek("Monday")).toBe("monday");
    expect(parseDayOfWeek("tue")).toBe("tuesday");
    expect(parseDayOfWeek("SAT")).toBe("saturday");
    expect(parseDayOfWeek("")).toBeNull();
    expect(parseDayOfWeek("holiday")).toBeNull();
  });
});

describe("orderUpcomingWeeklyScheduleSlots", () => {
  it("drops ended today and puts next day first", () => {
    const now = new Date("2026-06-02T15:00:00"); // Tuesday
    const ordered = orderUpcomingWeeklyScheduleSlots(
      [
        { id: "tue-past", dayOfWeek: "tuesday", startTime: "08:00", endTime: "09:00" },
        { id: "wed-1", dayOfWeek: "wednesday", startTime: "08:00", endTime: "09:00" },
        { id: "fri-1", dayOfWeek: "friday", startTime: "08:00", endTime: "09:00" },
      ],
      now,
    );
    expect(ordered.map((s) => s.id)).toEqual(["wed-1", "fri-1"]);
  });
});

describe("scheduleSubjectTeacherLine", () => {
  it("combines subject and teacher initials", () => {
    expect(
      scheduleSubjectTeacherLine({ subject: "Math", teacherName: "Mohammed" }),
    ).toBe("Math / Moh");
  });
});
