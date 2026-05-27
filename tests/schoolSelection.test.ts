import {
  applyRegistryToStoredSchool,
  storedSchoolNeedsPersist,
  toStoredSchool,
} from "../src/utils/schoolSelection";
import type { SchoolRecord, StoredSchool } from "../src/types/school";

const baseStored: StoredSchool = {
  id: "school-1",
  name: "Old Name",
  usageExpiresAt: null,
  firebase: {
    apiKey: "k",
    authDomain: "a",
    projectId: "p",
    storageBucket: "s",
    messagingSenderId: "m",
    appId: "app",
  },
};

describe("applyRegistryToStoredSchool", () => {
  it("returns stored unchanged when registry entry is null", () => {
    expect(applyRegistryToStoredSchool(baseStored, null)).toEqual(baseStored);
  });

  it("merges name and usage expiry from registry", () => {
    const merged = applyRegistryToStoredSchool(baseStored, {
      id: "school-1",
      name: "New Name",
      usageExpiresAt: "2026-12-31",
    });
    expect(merged.name).toBe("New Name");
    expect(merged.usageExpiresAt).toBe("2026-12-31");
    expect(merged.firebase).toBe(baseStored.firebase);
  });
});

describe("storedSchoolNeedsPersist", () => {
  it("detects name or expiry changes", () => {
    const after = { ...baseStored, name: "Updated" };
    expect(storedSchoolNeedsPersist(baseStored, after)).toBe(true);
    expect(storedSchoolNeedsPersist(baseStored, baseStored)).toBe(false);
  });
});

describe("toStoredSchool", () => {
  it("maps SchoolRecord to StoredSchool", () => {
    const record: SchoolRecord = {
      id: "s1",
      name: "School",
      active: true,
      firebase: baseStored.firebase,
      usageExpiresAt: "2026-01-01",
    };
    expect(toStoredSchool(record).usageExpiresAt).toBe("2026-01-01");
  });
});
