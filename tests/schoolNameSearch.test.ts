import type { SchoolRecord } from "../src/types/school";
import {
  filterSchoolsByNameQuery,
  normalizeSchoolNameQuery,
} from "../src/utils/schoolNameSearch";

function school(
  partial: Partial<SchoolRecord> & Pick<SchoolRecord, "id" | "name">,
): SchoolRecord {
  return {
    active: true,
    firebase: {
      apiKey: "k",
      authDomain: "a",
      projectId: "p",
      storageBucket: "s",
      messagingSenderId: "m",
      appId: "app",
    },
    ...partial,
  };
}

describe("schoolNameSearch", () => {
  const schools = [
    school({ id: "1", name: "Helsinki International School" }),
    school({ id: "2", name: "Helsinki Academy" }),
    school({ id: "3", name: "Tampere School" }),
    school({ id: "4", name: "  Dugsi  Center  " }),
  ];

  it("normalizes whitespace and case", () => {
    expect(normalizeSchoolNameQuery("  Hello   World ")).toBe("hello world");
  });

  it("returns empty when query is blank", () => {
    expect(filterSchoolsByNameQuery(schools, "   ")).toEqual([]);
  });

  it("prefers starts-with matches over contains", () => {
    const results = filterSchoolsByNameQuery(schools, "hel");
    expect(results.map((s) => s.id)).toEqual(["2", "1"]);
  });

  it("matches contains and ignores extra spaces in query", () => {
    const results = filterSchoolsByNameQuery(schools, "  dugsi  center ");
    expect(results.map((s) => s.id)).toEqual(["4"]);
  });

  it("respects limit", () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      school({ id: String(i), name: `School ${i}` }),
    );
    expect(filterSchoolsByNameQuery(many, "school", 5)).toHaveLength(5);
  });
});
