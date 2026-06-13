import { Platform, useWindowDimensions } from "react-native";

export const WEB_DESKTOP_BREAKPOINT = 1024;

export type PlatformLayout = {
  isWeb: boolean;
  isNative: boolean;
  isDesktopWeb: boolean;
  isCompactWeb: boolean;
  width: number;
};

export function usePlatformLayout(): PlatformLayout {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  return {
    isWeb,
    isNative: !isWeb,
    isDesktopWeb: isWeb && width >= WEB_DESKTOP_BREAKPOINT,
    isCompactWeb: isWeb && width < WEB_DESKTOP_BREAKPOINT,
    width,
  };
}
