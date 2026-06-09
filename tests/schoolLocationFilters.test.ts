import type { SchoolRecord } from "../src/types/school";
import {
  UNSPECIFIED_CITY_KEY,
  UNSPECIFIED_COUNTRY_KEY,
  getCityOptions,
  getCountryOptions,
  getSchoolsInLocation,
  normalizeCountryKey,
} from "../src/utils/schoolLocationFilters";

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

describe("schoolLocationFilters", () => {
  const schools = [
    school({ id: "1", name: "Beta", country: "Finland", city: "Helsinki" }),
    school({ id: "2", name: "Alpha", country: "Finland", city: "Helsinki" }),
    school({ id: "3", name: "Gamma", country: "Finland", city: "Tampere" }),
    school({ id: "4", name: "Legacy", city: "Mogadishu" }),
  ];

  it("groups countries and sorts schools by name", () => {
    const countries = getCountryOptions(schools, "Other");
    expect(countries.map((c) => c.value)).toContain("Finland");
    expect(countries.map((c) => c.value)).toContain(UNSPECIFIED_COUNTRY_KEY);

    const helsinki = getSchoolsInLocation(
      schools,
      "Finland",
      "Helsinki",
    );
    expect(helsinki.map((s) => s.name)).toEqual(["Alpha", "Beta"]);
  });

  it("lists cities per country", () => {
    const cities = getCityOptions(schools, "Finland", "Other city");
    expect(cities.map((c) => c.value).sort()).toEqual(["Helsinki", "Tampere"]);
  });

  it("normalizes missing country", () => {
    expect(normalizeCountryKey(null)).toBe(UNSPECIFIED_COUNTRY_KEY);
    expect(normalizeCountryKey("  Kenya ")).toBe("Kenya");
  });
});
