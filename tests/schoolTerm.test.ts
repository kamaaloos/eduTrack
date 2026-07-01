import { defaultSchoolTermLabel } from "../src/utils/academicYear";
import { resolveSchoolTerm } from "../src/utils/schoolTerm";
import {
  purgeCountKeyForRootCollection,
  SCHOOL_TERM_CLASS_SUBCOLLECTIONS,
  SCHOOL_TERM_ROOT_COLLECTIONS,
} from "../src/utils/schoolTermPurge";

describe("schoolTermPurge", () => {
  it("lists root collections to purge", () => {
    expect(SCHOOL_TERM_ROOT_COLLECTIONS).toContain("attendance");
    expect(SCHOOL_TERM_ROOT_COLLECTIONS).toContain("grades");
    expect(SCHOOL_TERM_ROOT_COLLECTIONS).toContain("examResults");
  });

  it("lists class subcollections to purge", () => {
    expect(SCHOOL_TERM_CLASS_SUBCOLLECTIONS).toContain("homework");
    expect(SCHOOL_TERM_CLASS_SUBCOLLECTIONS).toContain("announcements");
    expect(SCHOOL_TERM_CLASS_SUBCOLLECTIONS).toContain("schedules");
  });

  it("lists parent complaints and timetables for purge", () => {
    expect(SCHOOL_TERM_ROOT_COLLECTIONS).toContain("parentComplaints");
    expect(SCHOOL_TERM_ROOT_COLLECTIONS).toContain("timetables");
  });

  it("maps root collections to count keys", () => {
    expect(purgeCountKeyForRootCollection("attendance")).toBe("attendance");
    expect(purgeCountKeyForRootCollection("messages")).toBe("announcements");
    expect(purgeCountKeyForRootCollection("parentComplaints")).toBe("parentComplaints");
    expect(purgeCountKeyForRootCollection("timetables")).toBe("schedules");
  });
});

describe("resolveSchoolTerm", () => {
  it("defaults missing record to active legacy term", () => {
    const term = resolveSchoolTerm(null);
    expect(term.status).toBe("active");
    expect(term.label).toBe(defaultSchoolTermLabel());
    expect(term.startedBy).toBe("legacy");
  });

  it("preserves between status", () => {
    const term = resolveSchoolTerm({
      status: "between",
      label: "2024-2025",
      startedAt: "2024-08-01T00:00:00.000Z",
      startedBy: "admin1",
      endedAt: "2025-06-01T00:00:00.000Z",
      endedBy: "admin1",
    });
    expect(term.status).toBe("between");
    expect(term.label).toBe("2024-2025");
  });
});

describe("defaultSchoolTermLabel", () => {
  it("formats academic year label", () => {
    expect(defaultSchoolTermLabel(new Date("2025-09-01"))).toBe("2025-2026");
    expect(defaultSchoolTermLabel(new Date("2025-03-01"))).toBe("2024-2025");
  });
});
