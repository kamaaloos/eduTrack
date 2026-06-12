/** Android application ID from app.json */
export const ANDROID_PACKAGE = "com.maylesoft.edutrack";

/** iOS bundle identifier from app.json */
export const IOS_BUNDLE_ID = "com.maylesoft.edutrack";

/**
 * Google Play listing. Override with EXPO_PUBLIC_PLAY_STORE_URL when the live URL differs.
 */
export const PLAY_STORE_URL =
  process.env.EXPO_PUBLIC_PLAY_STORE_URL?.trim() ||
  `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

/**
 * App Store listing. Set EXPO_PUBLIC_APP_STORE_URL when the app is published
 * (e.g. https://apps.apple.com/app/id123456789).
 */
export const APP_STORE_URL = process.env.EXPO_PUBLIC_APP_STORE_URL?.trim() || "";

export function isPlayStoreConfigured(): boolean {
  return PLAY_STORE_URL.length > 0;
}

export function isAppStoreConfigured(): boolean {
  return APP_STORE_URL.length > 0;
}
