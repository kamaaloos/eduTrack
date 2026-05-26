import { normalizeSubjectKey, subjectsMatch } from "../src/utils/subjectKey";

describe("normalizeSubjectKey", () => {
  it("slugifies latin names", () => {
    expect(normalizeSubjectKey("English Language")).toBe("english_language");
  });

  it("uses hash fallback for non-latin names", () => {
    const key = normalizeSubjectKey("القرآن");
    expect(key).toMatch(/^sub_\d+$/);
    expect(normalizeSubjectKey("القرآن")).toBe(key);
  });
});

describe("subjectsMatch", () => {
  it("compares normalized keys", () => {
    expect(subjectsMatch("Math", "math")).toBe(true);
    expect(subjectsMatch("Math", "Science")).toBe(false);
  });
});
