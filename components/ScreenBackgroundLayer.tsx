import {
  ImageBackground,
  Platform,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { useSchoolTheme } from "../src/context/schoolThemeContext";

type ScreenBackgroundLayerProps = {
  style?: ViewStyle;
};

/** Decorative backdrop — themed CSS gradient on web, login-bg image on native. */
export function ScreenBackgroundLayer({ style }: ScreenBackgroundLayerProps) {
  const { webPageBackgroundStyle } = useSchoolTheme();

  if (Platform.OS === "web") {
    return (
      <View
        style={[StyleSheet.absoluteFillObject, webPageBackgroundStyle, style]}
        pointerEvents="none"
      />
    );
  }

  return (
    <ImageBackground
      source={require("../assets/images/login-bg.png")}
      style={[StyleSheet.absoluteFillObject, style]}
      resizeMode="cover"
      pointerEvents="none"
    />
  );
}
