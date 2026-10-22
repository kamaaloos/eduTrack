import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { useSchoolTheme } from "../src/context/schoolThemeContext";
import { mixHex } from "../src/utils/schoolTheme";

type ScreenBackgroundLayerProps = {
  style?: ViewStyle;
};

/** School-themed backdrop on web and native (gradient / tinted wash). */
export function ScreenBackgroundLayer({ style }: ScreenBackgroundLayerProps) {
  const { theme, webPageBackgroundStyle } = useSchoolTheme();

  if (Platform.OS === "web") {
    return (
      <View
        style={[StyleSheet.absoluteFillObject, webPageBackgroundStyle, style]}
        pointerEvents="none"
      />
    );
  }

  const mid = mixHex(theme.accentColor, theme.backgroundColor, 0.55);

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: theme.backgroundColor },
        style,
      ]}
      pointerEvents="none"
    >
      <View
        style={[
          styles.nativeWashTop,
          { backgroundColor: theme.accentColor },
        ]}
      />
      <View style={[styles.nativeWashMid, { backgroundColor: mid }]} />
      <View
        style={[
          styles.nativeWashPrimary,
          { backgroundColor: theme.primaryColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  nativeWashTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "38%",
    opacity: 0.32,
  },
  nativeWashMid: {
    position: "absolute",
    top: "22%",
    left: 0,
    right: 0,
    height: "40%",
    opacity: 0.5,
  },
  nativeWashPrimary: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "28%",
    opacity: 0.08,
  },
});
