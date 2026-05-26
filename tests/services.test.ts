import { getGrade } from "../src/utils/letterGrade";

describe("reportCardEngine.getGrade", () => {
  it("returns A for score >= 90", () => {
    expect(getGrade(95)).toBe("A");
    expect(getGrade(90)).toBe("A");
  });

  it("returns B for score >= 80 and < 90", () => {
    expect(getGrade(85)).toBe("B");
    expect(getGrade(80)).toBe("B");
  });

  it("returns C for score >= 70 and < 80", () => {
    expect(getGrade(75)).toBe("C");
    expect(getGrade(70)).toBe("C");
  });

  it("returns D for score >= 60 and < 70", () => {
    expect(getGrade(65)).toBe("D");
    expect(getGrade(60)).toBe("D");
  });

  it("returns F for score < 60", () => {
    expect(getGrade(55)).toBe("F");
    expect(getGrade(0)).toBe("F");
  });
});
