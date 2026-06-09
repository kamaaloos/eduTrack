import * as Application from "expo-application";
import Constants from "expo-constants";
import { Platform } from "react-native";

function readNativeVersion(): string | null {
  const fromApplication = Application.nativeApplicationVersion?.trim();
  if (fromApplication) return fromApplication;

  const fromConstants = Constants.nativeApplicationVersion?.trim();
  if (fromConstants) return fromConstants;

  const fromConfig = Constants.expoConfig?.version?.trim();
  return fromConfig || null;
}

function readNativeBuild(): string | null {
  const fromApplication = Application.nativeBuildVersion?.trim();
  if (fromApplication) return fromApplication;

  const fromConstants = Constants.nativeBuildVersion?.trim();
  if (fromConstants) return fromConstants;

  const androidCode = Constants.expoConfig?.android?.versionCode;
  if (androidCode != null && androidCode > 0) {
    return String(androidCode);
  }

  const iosBuild = Constants.expoConfig?.ios?.buildNumber?.trim();
  return iosBuild || null;
}

export function getAppVersion(): string {
  return readNativeVersion() ?? "—";
}

export function getAppBuildNumber(): string {
  if (Platform.OS === "web") {
    return "web";
  }

  return readNativeBuild() ?? "—";
}

export function getAppBuildNumberValue(): number | null {
  const raw = readNativeBuild();
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getAppVersionLabel(): string {
  const version = getAppVersion();
  const build = getAppBuildNumber();
  if (build === "—" || build === "web") return version;
  return `${version} (${build})`;
}
