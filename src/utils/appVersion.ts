import Constants from "expo-constants";

export function getAppVersion(): string {
  return (
    Constants.expoConfig?.version ??
    Constants.nativeApplicationVersion ??
    "—"
  );
}

export function getAppBuildNumber(): string {
  const build =
    Constants.nativeBuildVersion ??
    Constants.expoConfig?.android?.versionCode?.toString();
  return build ?? "—";
}

export function getAppVersionLabel(): string {
  const version = getAppVersion();
  const build = getAppBuildNumber();
  if (build === "—") return version;
  return `${version} (${build})`;
}
