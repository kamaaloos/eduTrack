import { Platform } from "react-native";
import {
  compareBuildForUpdate,
  type AppReleaseInfo,
} from "../utils/appUpdateCompare";
import { getAppBuildNumberValue, getAppVersion } from "../utils/appVersion";

export type { AppReleaseInfo } from "../utils/appUpdateCompare";

export type AppUpdateStatus =
  | { state: "checking" }
  | { state: "upToDate"; latestVersion: string; latestBuild: number }
  | {
      state: "updateAvailable";
      latestVersion: string;
      latestBuild: number;
      apkUrl: string;
    }
  | { state: "unknown" }
  | { state: "unsupported" };

function parseReleasePayload(raw: unknown): AppReleaseInfo | null {
  if (!raw || typeof raw !== "object") return null;

  const data = raw as Record<string, unknown>;
  const version =
    typeof data.version === "string" ? data.version.trim() : getAppVersion();
  const androidVersionCode = Number(data.androidVersionCode);
  const apkUrl = typeof data.apkUrl === "string" ? data.apkUrl.trim() : "";

  if (!Number.isFinite(androidVersionCode) || androidVersionCode <= 0 || !apkUrl) {
    return null;
  }

  return { version, androidVersionCode, apkUrl };
}

export async function fetchLatestAppRelease(): Promise<AppReleaseInfo | null> {
  const manifestUrl = process.env.EXPO_PUBLIC_APP_RELEASE_MANIFEST_URL?.trim();
  if (manifestUrl) {
    try {
      const response = await fetch(manifestUrl);
      if (!response.ok) return null;
      return parseReleasePayload(await response.json());
    } catch {
      return null;
    }
  }

  const apkUrl = process.env.EXPO_PUBLIC_LATEST_APK_URL?.trim();
  const buildRaw = process.env.EXPO_PUBLIC_LATEST_ANDROID_BUILD?.trim();
  const version = process.env.EXPO_PUBLIC_LATEST_APP_VERSION?.trim() || getAppVersion();
  const androidVersionCode = buildRaw ? Number.parseInt(buildRaw, 10) : Number.NaN;

  if (!apkUrl || !Number.isFinite(androidVersionCode) || androidVersionCode <= 0) {
    return null;
  }

  return { version, androidVersionCode, apkUrl };
}

export function resolveAppUpdateStatus(
  currentBuild: number | null,
  latest: AppReleaseInfo | null,
): Exclude<AppUpdateStatus, { state: "checking" }> {
  if (Platform.OS === "web") {
    return { state: "unsupported" };
  }

  return compareBuildForUpdate(currentBuild, latest);
}

export async function checkForAppUpdate(): Promise<AppUpdateStatus> {
  if (Platform.OS === "web") {
    return { state: "unsupported" };
  }

  const latest = await fetchLatestAppRelease();
  return resolveAppUpdateStatus(getAppBuildNumberValue(), latest);
}
