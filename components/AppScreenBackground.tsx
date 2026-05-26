import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { APP_COPYRIGHT } from "../src/constants/appTheme";

type AppScreenBackgroundProps = {
  children: React.ReactNode;
  showCopyright?: boolean;
  /** Extra space above copyright (e.g. floating tab bar). */
  copyrightBottomOffset?: number;
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
  style,
}: AppScreenBackgroundProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, style]}>
      <ImageBackground
        source={require("../assets/images/login-bg.png")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        pointerEvents="none"
      />
      {showCopyright ? (
        <Text
          style={[
            styles.copyright,
            { paddingBottom: insets.bottom + copyrightBottomOffset + 8 },
          ]}
          pointerEvents="none"
        >
          {APP_COPYRIGHT}
        </Text>
      ) : null}
      <View style={styles.content} pointerEvents="box-none">
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
    zIndex: 0,
  },
});
