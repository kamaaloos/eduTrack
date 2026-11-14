import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { useSchoolTheme } from "../src/context/schoolThemeContext";

type ScreenBackgroundLayerProps = {
  style?: ViewStyle;
};

/** School-themed backdrop: web gradient, native flat background color. */
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

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: theme.backgroundColor },
        style,
      ]}
      pointerEvents="none"
    />
  );
}
