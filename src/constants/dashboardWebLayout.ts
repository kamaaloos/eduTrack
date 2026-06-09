import { Platform, type ViewStyle } from "react-native";

export const WEB_DASHBOARD_MAX_WIDTH = 960;

export function webDashboardContentStyle(): ViewStyle | undefined {
  if (Platform.OS !== "web") return undefined;
  return {
    width: "100%",
    maxWidth: WEB_DASHBOARD_MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  };
}
