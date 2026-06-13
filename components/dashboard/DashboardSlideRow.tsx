import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import { webResponsiveGridStyle } from "../../src/constants/platformLayout";
import { dashboardStyles } from "./dashboardStyles";

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

function slideGridStyle(layout: ReturnType<typeof usePlatformLayout>): ViewStyle {
  const minWidth = layout.isDesktopWeb ? 260 : layout.isTabletWeb ? 240 : 280;
  return {
    ...(webResponsiveGridStyle(layout, minWidth) ?? {}),
  } as ViewStyle;
}

/** Horizontal carousel, or wrapped grid on web when variant is grid. */
export function DashboardSlideRow({
  children,
  contentStyle,
  variant,
}: DashboardSlideRowProps) {
  const layout = usePlatformLayout();

  const useCarousel =
    Platform.OS === "web" ? variant === "carousel" : variant !== "grid";

  if (!useCarousel) {
    return (
      <View style={[slideGridStyle(layout), contentStyle]}>{children}</View>
    );
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
