import { Platform, type ViewStyle } from "react-native";
import { MOBILE_SCREEN_HORIZONTAL_PADDING } from "./appTheme";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import {
  webAuthCardStyle,
  webListContentStyle,
  webRolePagePaddingStyle,
} from "./platformLayout";

export const WEB_AUTH_MAX_WIDTH = 520;
export const WEB_CONTENT_MAX_WIDTH = 960;
export const WEB_ADMIN_MAX_WIDTH = 960;
/** Full app page card on desktop web (header + body). */
export const WEB_PAGE_CARD_MAX_WIDTH = 1200;

/** @deprecated Prefer `useWebAuthContentStyle()` or `webAuthCardStyle(layout)`. */
export function webAuthContentStyle(): ViewStyle | undefined {
  if (Platform.OS !== "web") {
    return undefined;
  }
  return {
    width: "100%",
    maxWidth: WEB_AUTH_MAX_WIDTH,
    alignSelf: "center",
  };
}

/** @deprecated Prefer `useWebListContentStyle()`. */
export function webListContentStyleLegacy(): ViewStyle | undefined {
  if (Platform.OS !== "web") {
    return undefined;
  }
  return {
    width: "100%",
    maxWidth: WEB_CONTENT_MAX_WIDTH,
    alignSelf: "center",
  };
}

/** @deprecated Prefer `useWebRolePagePaddingStyle()`. */
export function webAdminContentStyle(): ViewStyle | undefined {
  if (Platform.OS !== "web") {
    return undefined;
  }
  return {
    width: "100%",
    maxWidth: WEB_ADMIN_MAX_WIDTH,
    alignSelf: "center",
  };
}

/** @deprecated Prefer `useWebRolePagePaddingStyle()`. */
export function webAdminPagePaddingStyle(): ViewStyle | undefined {
  if (Platform.OS !== "web") {
    return undefined;
  }
  return {
    paddingHorizontal: 24,
  };
}

/** Native phone/tablet content inset (web uses webRolePagePaddingStyle). */
export function mobileScreenPaddingStyle(): ViewStyle | undefined {
  if (Platform.OS === "web") {
    return undefined;
  }
  return {
    paddingHorizontal: MOBILE_SCREEN_HORIZONTAL_PADDING,
  };
}

export function useWebAuthContentStyle(): ViewStyle | undefined {
  const layout = usePlatformLayout();
  if (!layout.isWeb) {
    return undefined;
  }
  return webAuthCardStyle(layout);
}

export function useWebRolePagePaddingStyle(): ViewStyle | undefined {
  const layout = usePlatformLayout();
  return webRolePagePaddingStyle(layout);
}

export function useWebListContentStyle(): ViewStyle | undefined {
  const layout = usePlatformLayout();
  return webListContentStyle(layout);
}
