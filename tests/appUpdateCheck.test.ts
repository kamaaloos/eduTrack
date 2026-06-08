import { compareBuildForUpdate } from "../src/utils/appUpdateCompare";

describe("compareBuildForUpdate", () => {
  const latest = {
    version: "1.0.1",
    androidVersionCode: 10,
    apkUrl: "https://example.com/app.apk",
  };

  it("reports up to date when build matches", () => {
    expect(compareBuildForUpdate(10, latest)).toEqual({
      state: "upToDate",
      latestVersion: "1.0.1",
      latestBuild: 10,
    });
  });

  it("reports update available when build is older", () => {
    expect(compareBuildForUpdate(9, latest)).toEqual({
      state: "updateAvailable",
      latestVersion: "1.0.1",
      latestBuild: 10,
      apkUrl: "https://example.com/app.apk",
    });
  });

  it("reports unknown when release info is missing", () => {
    expect(compareBuildForUpdate(5, null)).toEqual({ state: "unknown" });
  });
});
