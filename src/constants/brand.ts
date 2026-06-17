export type AppBrand = "edutrack" | "dugsi";

function readBrand(): AppBrand {
  const raw = process.env.EXPO_PUBLIC_APP_BRAND?.trim().toLowerCase();
  return raw === "dugsi" ? "dugsi" : "edutrack";
}

/** Build-time platform id. Set `EXPO_PUBLIC_APP_BRAND=dugsi` for the Dugsi app. */
export const APP_BRAND: AppBrand = readBrand();

/** User-visible product name (home screen, landing, notifications). */
export const APP_DISPLAY_NAME =
  process.env.EXPO_PUBLIC_APP_DISPLAY_NAME?.trim() ||
  (APP_BRAND === "dugsi" ? "Dugsi" : "eduTrack");

/** Deep link / QR scheme (`edutrack://` vs `dugsi://`). */
export const APP_SCHEME =
  process.env.EXPO_PUBLIC_APP_SCHEME?.trim() ||
  (APP_BRAND === "dugsi" ? "dugsi" : "edutrack");

export const ANDROID_PACKAGE =
  process.env.EXPO_PUBLIC_ANDROID_PACKAGE?.trim() ||
  (APP_BRAND === "dugsi" ? "com.maylesoft.dugsi" : "com.maylesoft.edutrack");

export const IOS_BUNDLE_IDENTIFIER =
  process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER?.trim() ||
  (APP_BRAND === "dugsi" ? "com.maylesoft.dugsi" : "com.maylesoft.edutrack");

export const PUSH_CHANNEL_ID =
  APP_BRAND === "dugsi" ? "dugsi-alerts" : "edutrack-alerts";

/** Replace with `assets/images/dugsi-logo.png` when the Dugsi wordmark is ready. */
export const APP_LOGO = require("../../assets/images/edutrack-logo.png");
