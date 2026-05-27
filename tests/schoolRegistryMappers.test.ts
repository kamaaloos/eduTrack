import {
  mapSchoolRegistryDoc,
  normalizeFirebaseConfig,
  normalizeUsageExpiresAt,
} from "../src/services/schoolRegistryMappers";

describe("normalizeFirebaseConfig", () => {
  it("returns null when apiKey or projectId missing", () => {
    expect(normalizeFirebaseConfig(null)).toBeNull();
    expect(normalizeFirebaseConfig({ apiKey: "k" })).toBeNull();
  });

  it("trims and maps valid config", () => {
    const config = normalizeFirebaseConfig({
      apiKey: " key ",
      projectId: "proj",
      authDomain: "a",
      storageBucket: "b",
      messagingSenderId: "c",
      appId: "d",
    });
    expect(config?.apiKey).toBe("key");
    expect(config?.projectId).toBe("proj");
  });
});

describe("normalizeUsageExpiresAt", () => {
  it("normalizes ISO date strings", () => {
    expect(normalizeUsageExpiresAt("2026-12-31")).toBe("2026-12-31");
    expect(normalizeUsageExpiresAt(" 2026-12-31 ")).toBe("2026-12-31");
  });

  it("normalizes Firestore Timestamp-like objects", () => {
    const value = {
      toDate: () => new Date("2026-06-15T10:00:00Z"),
    };
    expect(normalizeUsageExpiresAt(value)).toBe("2026-06-15");
  });
});

describe("mapSchoolRegistryDoc", () => {
  it("maps a valid registry document", () => {
    const school = mapSchoolRegistryDoc("school-1", {
      name: "Test School",
      active: true,
      firebase: {
        apiKey: "k",
        projectId: "p",
        authDomain: "a",
        storageBucket: "s",
        messagingSenderId: "m",
        appId: "app",
      },
      usageExpiresAt: "2026-12-31",
      city: "Helsinki",
    });
    expect(school).toMatchObject({
      id: "school-1",
      name: "Test School",
      active: true,
      usageExpiresAt: "2026-12-31",
      city: "Helsinki",
    });
  });

  it("returns null when firebase config invalid", () => {
    expect(mapSchoolRegistryDoc("x", { name: "Bad" })).toBeNull();
  });
});
