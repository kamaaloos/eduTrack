import { Platform, type ViewStyle } from "react-native";

/** Full-width page backdrop on web (login-bg.png is not wide enough for desktop). */
export const WEB_PAGE_BACKGROUND_STYLE: ViewStyle =
  Platform.OS === "web"
    ? {
        backgroundColor: "#E8F2FA",
        // RN Web supports CSS gradients on View.
        backgroundImage:
          "linear-gradient(165deg, #6B9FD4 0%, #8EB8E5 18%, #C5DFF0 42%, #E8F2FA 58%)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }
    : {};

export const WEB_PAGE_ROOT_STYLE: ViewStyle =
  Platform.OS === "web"
    ? {
        width: "100%",
        minHeight: "100vh",
        alignSelf: "stretch",
      }
    : {};
