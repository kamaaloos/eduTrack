import { isSchoolRole, SCHOOL_ROLES } from "../src/utils/schoolRoles";

describe("schoolRoles", () => {
  it("exports the four school roles", () => {
    expect(SCHOOL_ROLES).toEqual(["student", "teacher", "parent", "admin"]);
  });

  it("accepts valid roles", () => {
    for (const role of SCHOOL_ROLES) {
      expect(isSchoolRole(role)).toBe(true);
    }
  });

  it("rejects invalid values", () => {
    expect(isSchoolRole("superAdmin")).toBe(false);
    expect(isSchoolRole("")).toBe(false);
    expect(isSchoolRole(null)).toBe(false);
    expect(isSchoolRole(undefined)).toBe(false);
  });
});
