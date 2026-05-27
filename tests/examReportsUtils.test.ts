import { scoreLabel } from "../components/teachers/examReports/examReportsUtils";

describe("scoreLabel", () => {
  it("formats score with max marks", () => {
    expect(scoreLabel(8, 10)).toBe("8/10");
  });

  it("formats percent when no max marks", () => {
    expect(scoreLabel(85, null)).toBe("85%");
  });

  it("returns dash for missing score", () => {
    expect(scoreLabel(null, 10)).toBe("—");
  });
});
