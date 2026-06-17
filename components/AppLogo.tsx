import {
  Image,
  StyleSheet,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { APP_DISPLAY_NAME, APP_LOGO } from "../src/constants/brand";

/** Primary brand logo (per `EXPO_PUBLIC_APP_BRAND`). */
export { APP_LOGO };

type AppLogoProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export function AppLogo({ size = 96, style, imageStyle }: AppLogoProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Image
        source={APP_LOGO}
        style={[
          styles.image,
          { width: size, height: size },
          imageStyle,
        ]}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel={APP_DISPLAY_NAME}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
