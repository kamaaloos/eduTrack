import {
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  APP_COPYRIGHT,
  copyrightBarBottom,
  copyrightFooterInset,
} from "../src/constants/appTheme";
import { WEB_PAGE_ROOT_STYLE } from "../src/constants/webBackground";
import { ScreenBackgroundLayer } from "./ScreenBackgroundLayer";

type AppScreenBackgroundProps = {
  children: React.ReactNode;
  showCopyright?: boolean;
  /** Extra space above copyright (e.g. floating tab bar). */
  copyrightBottomOffset?: number;
  /** Pad content above the copyright bar (disable on web tab screens — they pad internally). */
  reserveContentFooterSpace?: boolean;
  style?: ViewStyle;
};

/**
 * Decorative background only — does not wrap interactive content in ImageBackground,
 * so floating tab bars and buttons stay tappable.
 */
export function AppScreenBackground({
  children,
  showCopyright = true,
  copyrightBottomOffset = 0,
  reserveContentFooterSpace = true,
  style,
}: AppScreenBackgroundProps) {
  const insets = useSafeAreaInsets();
  const footerInset =
    showCopyright && reserveContentFooterSpace
      ? copyrightFooterInset(insets.bottom, copyrightBottomOffset)
      : 0;
  const copyrightBottom = copyrightBarBottom(
    insets.bottom,
    copyrightBottomOffset,
  );

  return (
    <View style={[styles.root, WEB_PAGE_ROOT_STYLE, style]}>
      <ScreenBackgroundLayer />
      {showCopyright ? (
        <Text
          style={[styles.copyright, { bottom: copyrightBottom }]}
          pointerEvents="none"
        >
          {APP_COPYRIGHT}
        </Text>
      ) : null}
      <View
        style={[styles.content, footerInset > 0 && { paddingBottom: footerInset }]}
        pointerEvents="box-none"
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },
  content: {
    flex: 1,
  },
  copyright: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(12, 74, 110, 0.75)",
    letterSpacing: 0.3,
    zIndex: 2,
  },
});
