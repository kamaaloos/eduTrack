export type AppReleaseInfo = {
  version: string;
  androidVersionCode: number;
  apkUrl: string;
};

export type AppUpdateCompareResult =
  | { state: "upToDate"; latestVersion: string; latestBuild: number }
  | {
      state: "updateAvailable";
      latestVersion: string;
      latestBuild: number;
      apkUrl: string;
    }
  | { state: "unknown" };

export function compareBuildForUpdate(
  currentBuild: number | null,
  latest: AppReleaseInfo | null,
): AppUpdateCompareResult {
  if (currentBuild == null || !latest) {
    return { state: "unknown" };
  }

  if (currentBuild >= latest.androidVersionCode) {
    return {
      state: "upToDate",
      latestVersion: latest.version,
      latestBuild: latest.androidVersionCode,
    };
  }

  return {
    state: "updateAvailable",
    latestVersion: latest.version,
    latestBuild: latest.androidVersionCode,
    apkUrl: latest.apkUrl,
  };
}
