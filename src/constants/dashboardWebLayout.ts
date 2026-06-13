import type { ViewStyle } from "react-native";
import { Platform } from "react-native";
import { usePlatformLayout } from "../hooks/usePlatformLayout";import {
  webDashboardContentStyle as webDashboardContentStyleForLayout,
} from "./platformLayout";

export const WEB_DASHBOARD_MAX_WIDTH = 960;

/** @deprecated Prefer `webDashboardContentStyle(layout)` from `platformLayout`. */
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

export function useWebDashboardContentStyle(): ViewStyle | undefined {
  const layout = usePlatformLayout();
  return webDashboardContentStyleForLayout(layout);
}
