import { APP_BRAND } from "./brand";

/**
 * EAS internal-distribution install URL (from Expo build → Install on a test device).
 * Set EXPO_PUBLIC_ANDROID_INSTALL_URL, or brand-specific overrides below.
 */
export const ANDROID_INSTALL_URL = (() => {
  const dugsi = process.env.EXPO_PUBLIC_DUGSI_ANDROID_INSTALL_URL?.trim();
  const edutrack = process.env.EXPO_PUBLIC_EDUTRACK_ANDROID_INSTALL_URL?.trim();
  const shared = process.env.EXPO_PUBLIC_ANDROID_INSTALL_URL?.trim();
  if (APP_BRAND === "dugsi" && dugsi) return dugsi;
  if (APP_BRAND === "edutrack" && edutrack) return edutrack;
  return shared || dugsi || edutrack || "";
})();

export function isAndroidInstallQrConfigured(): boolean {
  return ANDROID_INSTALL_URL.length > 0;
}
