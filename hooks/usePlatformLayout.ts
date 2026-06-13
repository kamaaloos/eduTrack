import { Platform, useWindowDimensions } from "react-native";

export const WEB_TABLET_BREAKPOINT = 768;
export const WEB_DESKTOP_BREAKPOINT = 1024;

export const WEB_PAGE_MAX_WIDTH_DESKTOP = 1200;
export const WEB_PAGE_MAX_WIDTH_TABLET = 960;
export const WEB_AUTH_MAX_WIDTH = 520;
export const WEB_DASHBOARD_MAX_WIDTH_DESKTOP = 1200;
export const WEB_DASHBOARD_MAX_WIDTH_TABLET = 960;

export type PlatformLayout = {
  isWeb: boolean;
  isNative: boolean;
  isCompactWeb: boolean;
  isTabletWeb: boolean;
  isDesktopWeb: boolean;
  width: number;
};

export function usePlatformLayout(): PlatformLayout {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  return {
    isWeb,
    isNative: !isWeb,
    isCompactWeb: isWeb && width < WEB_TABLET_BREAKPOINT,
    isTabletWeb:
      isWeb && width >= WEB_TABLET_BREAKPOINT && width < WEB_DESKTOP_BREAKPOINT,
    isDesktopWeb: isWeb && width >= WEB_DESKTOP_BREAKPOINT,
    width,
  };
}
