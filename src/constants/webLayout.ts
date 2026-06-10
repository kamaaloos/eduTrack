import { Platform } from "react-native";
import { MOBILE_SCREEN_HORIZONTAL_PADDING } from "./appTheme";

export const WEB_AUTH_MAX_WIDTH = 520;
export const WEB_CONTENT_MAX_WIDTH = 960;
export const WEB_ADMIN_MAX_WIDTH = 960;

export function webAuthContentStyle() {
  if (Platform.OS !== "web") {
    return undefined;
  }
  return {
    width: "100%" as const,
    maxWidth: WEB_AUTH_MAX_WIDTH,
    alignSelf: "center" as const,
  };
}

export function webListContentStyle() {
  if (Platform.OS !== "web") {
    return undefined;
  }
  return {
    width: "100%" as const,
    maxWidth: WEB_CONTENT_MAX_WIDTH,
    alignSelf: "center" as const,
  };
}

/** Centered admin / dashboard page column on desktop web. */
export function webAdminContentStyle() {
  if (Platform.OS !== "web") {
    return undefined;
  }
  return {
    width: "100%" as const,
    maxWidth: WEB_ADMIN_MAX_WIDTH,
    alignSelf: "center" as const,
  };
}

export function webAdminPagePaddingStyle() {
  if (Platform.OS !== "web") {
    return undefined;
  }
  return {
    paddingHorizontal: 24,
  };
}

/** Native phone/tablet content inset (web uses webAdminPagePaddingStyle). */
export function mobileScreenPaddingStyle() {
  if (Platform.OS === "web") {
    return undefined;
  }
  return {
    paddingHorizontal: MOBILE_SCREEN_HORIZONTAL_PADDING,
  };
}
