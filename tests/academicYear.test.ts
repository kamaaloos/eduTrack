import {
  examDateInAcademicYear,
  formatAcademicYear,
  getAcademicYearStart,
  listAcademicYearStarts,
} from "../src/utils/academicYear";
import { escapeHtml } from "../src/utils/htmlEscape";

describe("academicYear", () => {
  it("uses August as academic year boundary", () => {
    expect(getAcademicYearStart(new Date("2025-09-01"))).toBe(2025);
    expect(getAcademicYearStart(new Date("2025-07-01"))).toBe(2024);
  });

  it("formats academic year labels", () => {
    expect(formatAcademicYear(2025)).toBe("2025-2026");
  });

  it("lists recent academic years", () => {
    const years = listAcademicYearStarts(3);
    expect(years).toHaveLength(3);
    expect(years[0]).toBeGreaterThanOrEqual(years[1]);
  });

  it("includes undated exams in academic year filter", () => {
    expect(examDateInAcademicYear(undefined, 2025)).toBe(true);
  });
});

describe("escapeHtml", () => {
  it("escapes unsafe characters", () => {
    expect(escapeHtml(`Tom & "Jerry" <script>`)).toBe(
      "Tom &amp; &quot;Jerry&quot; &lt;script&gt;",
    );
  });
});
