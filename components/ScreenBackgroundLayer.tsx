import {
  ImageBackground,
  Platform,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import {
  WEB_PAGE_BACKGROUND_STYLE,
} from "../src/constants/webBackground";

type ScreenBackgroundLayerProps = {
  style?: ViewStyle;
};

/** Decorative backdrop — CSS gradient on web, login-bg image on native. */
export function ScreenBackgroundLayer({ style }: ScreenBackgroundLayerProps) {
  if (Platform.OS === "web") {
    return (
      <View
        style={[StyleSheet.absoluteFillObject, WEB_PAGE_BACKGROUND_STYLE, style]}
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
