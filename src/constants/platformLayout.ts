import type { ViewStyle } from "react-native";
import type { PlatformLayout } from "../../hooks/usePlatformLayout";
import { platformShadow } from "../utils/platformShadow";

export function adminContentPaddingStyle(layout: PlatformLayout): ViewStyle {
  return {
    paddingHorizontal: layout.isNative ? 16 : 0,
    paddingTop: layout.isWeb ? 24 : 16,
    paddingBottom: layout.isWeb ? 32 : 20,
  };
}

export function adminSurfaceCardStyle(layout: PlatformLayout): ViewStyle {
  return {
    backgroundColor: "#FFFFFF",
    borderRadius: layout.isWeb ? 12 : 18,
    padding: layout.isWeb ? 14 : 16,
    ...platformShadow("sm"),
    ...(layout.isWeb
      ? { borderWidth: 1, borderColor: "#E2E8F0" }
      : null),
  };
}

export function adminGridContainerStyle(layout: PlatformLayout): ViewStyle | undefined {
  if (!layout.isWeb) {
    return undefined;
  }

  return {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  };
}

export function adminGridItemStyle(
  layout: PlatformLayout,
  desktopColumns: 2 | 3 | 4,
): ViewStyle | undefined {
  if (!layout.isWeb) {
    return undefined;
  }

  const desktopBasis = `${Math.floor(100 / desktopColumns) - 2}%` as `${number}%`;

  return {
    flexGrow: 1,
    flexBasis: layout.isDesktopWeb ? desktopBasis : "48%",
    minWidth: layout.isDesktopWeb ? 180 : 260,
    maxWidth: layout.isDesktopWeb ? undefined : "100%",
  };
}

export function adminStatGridItemStyle(layout: PlatformLayout): ViewStyle | undefined {
  if (!layout.isWeb) {
    return undefined;
  }

  return {
    flexGrow: 1,
    flexBasis: layout.isDesktopWeb ? "22%" : "48%",
    minWidth: layout.isDesktopWeb ? 150 : 200,
    maxWidth: layout.isDesktopWeb ? 220 : undefined,
  };
}

export function adminMenuCardStyle(layout: PlatformLayout): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: layout.isWeb ? 12 : 18,
    padding: layout.isWeb ? 14 : 16,
    marginBottom: layout.isWeb ? 0 : 12,
    gap: 14,
    ...platformShadow("sm"),
    ...(layout.isWeb
      ? { borderWidth: 1, borderColor: "#E2E8F0" }
      : null),
    ...(adminGridItemStyle(layout, 2) ?? null),
  };
}

export function adminInsightCardStyle(layout: PlatformLayout): ViewStyle {
  return {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: layout.isWeb ? 14 : 16,
    borderRadius: layout.isWeb ? 12 : 16,
    flexDirection: layout.isWeb ? "row" : "column",
    alignItems: "center",
    justifyContent: layout.isWeb ? "flex-start" : "center",
    gap: layout.isWeb ? 10 : 6,
    ...platformShadow("sm"),
    ...(layout.isWeb
      ? { borderWidth: 1, borderColor: "#E2E8F0", minHeight: 56 }
      : null),
  };
}

/** Scroll content for admin directory / list screens inside AdminScreenShell. */
export function adminScreenScrollStyle(layout: PlatformLayout): ViewStyle {
  return {
    paddingHorizontal: layout.isNative ? 16 : 0,
    paddingTop: 12,
    paddingBottom: 40,
  };
}

export function adminModalBackdropStyle(layout: PlatformLayout): ViewStyle {
  return {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: layout.isWeb ? "center" : "flex-end",
    alignItems: layout.isWeb ? "center" : "stretch",
    padding: layout.isWeb ? 24 : 0,
  };
}

export function adminModalCardStyle(layout: PlatformLayout): ViewStyle {
  return {
    backgroundColor: "#FFFFFF",
    borderRadius: layout.isWeb ? 16 : undefined,
    borderTopLeftRadius: layout.isWeb ? 16 : 20,
    borderTopRightRadius: layout.isWeb ? 16 : 20,
    width: layout.isWeb ? ("100%" as const) : undefined,
    maxWidth: layout.isWeb ? 480 : undefined,
    padding: 20,
    paddingBottom: layout.isWeb ? 20 : 32,
    ...(layout.isWeb
      ? ({ boxShadow: "0 12px 40px rgba(15, 23, 42, 0.2)" } as object)
      : null),
  };
}

export function adminModalAnimationType(
  layout: PlatformLayout,
): "fade" | "slide" {
  return layout.isWeb ? "fade" : "slide";
}

/** Card layout for directory lists on native and compact web. */
export function adminDirectoryCardStyle(layout: PlatformLayout): ViewStyle {
  return {
    backgroundColor: "#FFFFFF",
    borderRadius: layout.isWeb ? 12 : 16,
    padding: 14,
    marginBottom: layout.isNative ? 10 : 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...(layout.isCompactWeb ? adminGridItemStyle(layout, 2) : null),
  };
}

/** Two-column card grid on compact web only. */
export function adminDirectoryCardsWrapStyle(
  layout: PlatformLayout,
): ViewStyle | undefined {
  if (!layout.isCompactWeb) {
    return undefined;
  }

  return adminGridContainerStyle(layout);
}

export function adminDirectoryTableHeadStyle(): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginBottom: 4,
  };
}

export function adminDirectoryTableRowStyle(): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 8,
  };
}

export function adminChartHorizontalPadding(layout: PlatformLayout): number {
  if (layout.isDesktopWeb) {
    return 48;
  }
  if (layout.isWeb) {
    return 96;
  }
  return 48;
}
