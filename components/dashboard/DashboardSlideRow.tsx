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
    ...(Platform.OS === "web"
      ? ({
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        } as ViewStyle)
      : null),
  },
});

type DashboardSlideRowProps = {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  /**
   * carousel — horizontal slides on web (student/parent/teacher). Native: horizontal unless grid.
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
  // Mobile: horizontal slides by default (unchanged). Web: carousel only when requested.
  const useCarousel =
    Platform.OS === "web" ? variant === "carousel" : variant !== "grid";

  if (!useCarousel) {
    return <View style={[webSlideRowStyle, contentStyle]}>{children}</View>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        dashboardStyles.horizontalScrollContent,
        contentStyle,
      ]}
      nestedScrollEnabled
      style={Platform.OS === "web" ? localStyles.webHorizontalScroll : undefined}
      {...(Platform.OS === "web"
        ? ({ className: "dashboard-hide-scrollbar" } as object)
        : null)}
    >
      {children}
    </ScrollView>
  );
}
