import { useEffect } from "react";
import { Platform } from "react-native";
import * as SystemUI from "expo-system-ui";
import { AppScreenBackground } from "../AppScreenBackground";

const ANDROID_NAV_BAR_COLOR = "#E8F2FA";

type RoleAppFrameProps = {
  children: React.ReactNode;
  /** Extra space above copyright (e.g. floating tab bar). */
  copyrightBottomOffset?: number;
  showCopyright?: boolean;
};

/**
 * Role route wrapper — same login gradient backdrop as auth screens.
 */
export function RoleAppFrame({
  children,
  copyrightBottomOffset = 8,
  showCopyright = true,
}: RoleAppFrameProps) {
  useEffect(() => {
    if (Platform.OS === "android") {
      void SystemUI.setBackgroundColorAsync(ANDROID_NAV_BAR_COLOR);
    }
  }, []);

  return (
    <AppScreenBackground
      showCopyright={showCopyright}
      copyrightBottomOffset={copyrightBottomOffset}
    >
      {children}
    </AppScreenBackground>
  );
}
