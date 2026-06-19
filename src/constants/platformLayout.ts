import type { ViewStyle } from "react-native";
import type { PlatformLayout } from "../../hooks/usePlatformLayout";
import {
  INNER_CARD_BORDER_GREEN,
  INNER_CARD_BORDER_RED,
} from "./innerCardBorders";
import {
  WEB_AUTH_MAX_WIDTH,
  WEB_CONTENT_MAX_WIDTH,
  WEB_DASHBOARD_MAX_WIDTH_DESKTOP,
  WEB_DASHBOARD_MAX_WIDTH_TABLET,
  WEB_PAGE_MAX_WIDTH_DESKTOP,
  WEB_PAGE_MAX_WIDTH_TABLET,
  WEB_ROLE_SIDEBAR_PAGE_MAX_WIDTH_DESKTOP,
  WEB_ROLE_SIDEBAR_PAGE_MAX_WIDTH_TABLET,
} from "../../hooks/usePlatformLayout";
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
      ? { borderWidth: 1, borderColor: INNER_CARD_BORDER_GREEN }
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
      ? { borderWidth: 1, borderColor: INNER_CARD_BORDER_GREEN }
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
      ? { borderWidth: 1, borderColor: INNER_CARD_BORDER_GREEN, minHeight: 56 }
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
    borderColor: INNER_CARD_BORDER_GREEN,
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

function webPageMaxWidth(layout: PlatformLayout): number | "100%" {
  if (!layout.isWeb) {
    return "100%";
  }
  if (layout.isDesktopWeb) {
    return WEB_PAGE_MAX_WIDTH_DESKTOP;
  }
  if (layout.isTabletWeb) {
    return WEB_PAGE_MAX_WIDTH_TABLET;
  }
  return "100%";
}

function webHorizontalPadding(layout: PlatformLayout): number {
  if (!layout.isWeb) {
    return 0;
  }
  if (layout.isCompactWeb) {
    return 16;
  }
  if (layout.isTabletWeb) {
    return 20;
  }
  return 24;
}

/** Outer frame padding around the main web page card. */
export function webPageFrameStyle(layout: PlatformLayout): ViewStyle {
  if (!layout.isWeb) {
    return {};
  }

  const pad = webHorizontalPadding(layout);
  return {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: pad,
    paddingTop: 12,
    paddingBottom: 8,
  };
}

/** Narrower centered card for role shells beside desktop sidebar nav. */
export function webRoleSidebarPageCardStyle(layout: PlatformLayout): ViewStyle {
  if (!layout.isWeb) {
    return {};
  }

  const maxWidth = layout.isDesktopWeb
    ? WEB_ROLE_SIDEBAR_PAGE_MAX_WIDTH_DESKTOP
    : layout.isTabletWeb
      ? WEB_ROLE_SIDEBAR_PAGE_MAX_WIDTH_TABLET
      : ("100%" as const);

  return {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth,
    minHeight: 0,
  };
}

/** Max-width card wrapping role screens on web. */
export function webPageCardFrameStyle(layout: PlatformLayout): ViewStyle {
  if (!layout.isWeb) {
    return {};
  }

  return {
    flex: 1,
    width: "100%",
    maxWidth: webPageMaxWidth(layout),
    backgroundColor: "#FFFFFF",
    borderRadius: layout.isCompactWeb ? 20 : 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    minHeight: 0,
    ...( {
      boxShadow:
        "0 16px 48px rgba(15, 23, 42, 0.1), 0 4px 16px rgba(15, 23, 42, 0.06)",
    } as object),
  };
}

/** Auth / about standalone card sizing. */
export function webAuthCardStyle(layout: PlatformLayout): ViewStyle {
  if (!layout.isWeb) {
    return {};
  }

  return {
    width: "100%",
    maxWidth: WEB_AUTH_MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: layout.isCompactWeb ? 20 : 24,
    paddingVertical: layout.isCompactWeb ? 24 : 28,
  };
}

/** Wide standalone card (contact, download). */
export function webWideCardStyle(layout: PlatformLayout): ViewStyle {
  if (!layout.isWeb) {
    return {};
  }

  return {
    width: "100%",
    maxWidth: webPageMaxWidth(layout),
    alignSelf: "center",
  };
}

/** Readable content pages (FAQ). */
export function webContentCardStyle(layout: PlatformLayout): ViewStyle {
  if (!layout.isWeb) {
    return {};
  }

  return {
    width: "100%",
    maxWidth: WEB_CONTENT_MAX_WIDTH,
    alignSelf: "center",
    paddingHorizontal: layout.isCompactWeb ? 20 : 28,
    paddingVertical: layout.isCompactWeb ? 24 : 32,
  };
}

/** Inner padding for role screen bodies (admin, teacher, student, parent). */
export function webRolePagePaddingStyle(layout: PlatformLayout): ViewStyle | undefined {
  if (!layout.isWeb) {
    return undefined;
  }

  return {
    paddingHorizontal: webHorizontalPadding(layout),
  };
}

/** Dashboard scroll content — centered column that grows on desktop. */
export function webDashboardContentStyle(layout: PlatformLayout): ViewStyle | undefined {
  if (!layout.isWeb) {
    return undefined;
  }

  const maxWidth = layout.isDesktopWeb
    ? WEB_DASHBOARD_MAX_WIDTH_DESKTOP
    : WEB_DASHBOARD_MAX_WIDTH_TABLET;

  return {
    width: "100%",
    maxWidth,
    alignSelf: "center",
    paddingHorizontal: webHorizontalPadding(layout),
    paddingTop: 16,
    paddingBottom: 8,
  };
}

/** List / form content column on web. */
export function webListContentStyle(layout: PlatformLayout): ViewStyle | undefined {
  if (!layout.isWeb) {
    return undefined;
  }

  return {
    width: "100%",
    maxWidth: layout.isDesktopWeb
      ? WEB_DASHBOARD_MAX_WIDTH_DESKTOP
      : WEB_DASHBOARD_MAX_WIDTH_TABLET,
    alignSelf: "center",
  };
}

/** Dashboard section card on web. */
export function webDashboardSectionStyle(layout: PlatformLayout): ViewStyle | undefined {
  if (!layout.isWeb) {
    return undefined;
  }

  return {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_RED,
    padding: layout.isDesktopWeb ? 20 : 16,
    ...platformShadow("sm"),
  };
}

/** Two-column dashboard row on desktop web. */
export function webDashboardColumnsStyle(layout: PlatformLayout): ViewStyle | undefined {
  if (!layout.isDesktopWeb) {
    return undefined;
  }

  return {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    width: "100%",
  };
}

export function webDashboardColumnStyle(layout: PlatformLayout): ViewStyle | undefined {
  if (!layout.isDesktopWeb) {
    return undefined;
  }

  return {
    flex: 1,
    minWidth: 0,
  };
}

/** CSS grid for wrapped card rows on web. */
export function webResponsiveGridStyle(
  layout: PlatformLayout,
  minColumnWidth: number,
): ViewStyle | undefined {
  if (!layout.isWeb) {
    return undefined;
  }

  return {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`,
    gap: 12,
    width: "100%",
  } as ViewStyle;
}

/** Student tab bar width scales with viewport on web. */
export function webTabBarStyle(layout: PlatformLayout): ViewStyle | undefined {
  if (!layout.isWeb) {
    return undefined;
  }

  const maxWidth = layout.isDesktopWeb
    ? Math.min(layout.width - 48, 720)
    : layout.isTabletWeb
      ? Math.min(layout.width - 32, 560)
      : Math.min(layout.width * 0.92, 520);

  return {
    width: maxWidth,
    maxWidth: "92%",
  } as ViewStyle;
}

export function webTeacherQuickActionsStyle(
  layout: PlatformLayout,
): ViewStyle | undefined {
  if (!layout.isWeb) {
    return undefined;
  }

  if (layout.isCompactWeb) {
    return {
      flexDirection: "column",
      gap: 12,
      marginTop: 20,
      width: "100%",
    };
  }

  return {
    display: "grid",
    gridTemplateColumns: layout.isDesktopWeb
      ? "repeat(3, minmax(0, 1fr))"
      : "repeat(3, minmax(0, 1fr))",
    gap: 12,
    marginTop: 4,
    width: "100%",
  } as ViewStyle;
}
