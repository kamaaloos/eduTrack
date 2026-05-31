import {
  defaultStorageBucket,
  normalizeSchoolFirebaseConfig,
} from "../src/utils/firebaseConfig";

describe("defaultStorageBucket", () => {
  it("derives appspot bucket from project id", () => {
    expect(defaultStorageBucket("my-school")).toBe("my-school.appspot.com");
  });
});

describe("normalizeSchoolFirebaseConfig", () => {
  it("fills missing storageBucket", () => {
    const out = normalizeSchoolFirebaseConfig({
      apiKey: " k ",
      authDomain: "a.firebaseapp.com",
      projectId: "proj1",
      storageBucket: "",
      messagingSenderId: "1",
      appId: "app",
    });
    expect(out.storageBucket).toBe("proj1.appspot.com");
    expect(out.apiKey).toBe("k");
  });
});
