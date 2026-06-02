import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { dashboardStyles } from "./dashboardStyles";

const webSlideRowStyle: ViewStyle =
  Platform.OS === "web"
    ? {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 12,
        width: "100%",
      }
    : {};

const localStyles = StyleSheet.create({
  webHorizontalScroll: {
    width: "100%",
    overflow: "scroll",
  },
});

type DashboardSlideRowProps = {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  /**
   * carousel — horizontal slides (mobile default; use for schedule on web).
   * grid — wrapped cards on web only.
   */
  variant?: "carousel" | "grid";
};

/** Horizontal carousel, or wrapped grid on web when variant is grid. */
export function DashboardSlideRow({
  children,
  contentStyle,
  variant,
}: DashboardSlideRowProps) {
  const useCarousel =
    variant === "carousel" || (variant !== "grid" && Platform.OS !== "web");

  if (!useCarousel) {
    return (
      <View style={[webSlideRowStyle, contentStyle]}>{children}</View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={Platform.OS === "web"}
      contentContainerStyle={[
        dashboardStyles.horizontalScrollContent,
        contentStyle,
      ]}
      nestedScrollEnabled
      style={Platform.OS === "web" ? localStyles.webHorizontalScroll : undefined}
    >
      {children}
    </ScrollView>
  );
}
