import { useEffect } from "react";
import { Platform } from "react-native";
import * as SystemUI from "expo-system-ui";
import { AppScreenBackground } from "../AppScreenBackground";

const ANDROID_NAV_BAR_COLOR = "#E8F2FA";

type RoleAppFrameProps = {
  children: React.ReactNode;
  /** Extra space above copyright (e.g. floating tab bar). */
  copyrightBottomOffset?: number;
  /** Pad content above the copyright bar (disable on web tab screens — they pad internally). */
  reserveContentFooterSpace?: boolean;
  showCopyright?: boolean;
};

/**
 * Role route wrapper — same login gradient backdrop as auth screens.
 */
export function RoleAppFrame({
  children,
  copyrightBottomOffset = 8,
  reserveContentFooterSpace = true,
  showCopyright = true,
}: RoleAppFrameProps) {
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const timer = setTimeout(() => {
      void SystemUI.setBackgroundColorAsync(ANDROID_NAV_BAR_COLOR).catch(() => {
        /* ignore */
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AppScreenBackground
      showCopyright={showCopyright}
      copyrightBottomOffset={copyrightBottomOffset}
      reserveContentFooterSpace={reserveContentFooterSpace}
    >
      {children}
    </AppScreenBackground>
  );
}
