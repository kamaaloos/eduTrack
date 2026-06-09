import {
  formatTimeHHmm,
  getScheduleDayBadgeLabel,
  orderUpcomingWeeklyScheduleSlots,
  normalizeTimeHHmm,
  parseDayOfWeek,
  parseHHmmToMinutes,
  scheduleDateTimeLine,
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
    const now = new Date(2026, 5, 2, 15, 0, 0); // Tuesday (local)
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

describe("scheduleDateTimeLine with i18n", () => {
  const t = (key: string) =>
    key === "common.tomorrow"
      ? "Tomorrow"
      : key === "common.today"
        ? "Today"
        : key;

  it("includes Tomorrow and calendar date for next day", () => {
    const now = new Date(2026, 5, 2, 10, 0, 0); // Tuesday (local)
    const line = scheduleDateTimeLine(
      {
        dayOfWeek: "wednesday",
        startTime: "08:00",
        endTime: "09:00",
      },
      { t: t as never, referenceDate: now },
    );
    expect(line).toContain("Tomorrow");
    expect(line).toContain("08:00 - 09:00");
  });

  it("badge label is Tomorrow one day ahead", () => {
    const now = new Date(2026, 5, 2, 10, 0, 0);
    expect(getScheduleDayBadgeLabel(t as never, "wednesday", now)).toBe(
      "Tomorrow",
    );
  });
});

describe("scheduleSubjectTeacherLine", () => {
  it("combines subject and teacher initials", () => {
    expect(
      scheduleSubjectTeacherLine({ subject: "Math", teacherName: "Mohammed" }),
    ).toBe("Math / Moh");
  });
});
