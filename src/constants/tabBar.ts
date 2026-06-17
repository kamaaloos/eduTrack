export const FLOATING_TAB_BAR_HEIGHT = 58;
export const FLOATING_TAB_BAR_BOTTOM_MARGIN = 8;
export const FLOATING_TAB_BAR_HORIZONTAL_MARGIN = 12;
const FLOATING_TAB_BAR_VERTICAL_PADDING = 6;

/** Space reserved above the floating tab bar (height + bottom offset + padding). */
export const FLOATING_TAB_BAR_INSET =
  FLOATING_TAB_BAR_BOTTOM_MARGIN +
  FLOATING_TAB_BAR_HEIGHT +
  FLOATING_TAB_BAR_VERTICAL_PADDING * 2;

/** Web-only scroll padding alias (native uses FLOATING_TAB_BAR_INSET in dashboard). */
export const WEB_TAB_SCREEN_BOTTOM_PADDING = FLOATING_TAB_BAR_INSET;

/** Copyright baseline — slightly below tab-bar reserve (lower on screen). */
export const STUDENT_COPYRIGHT_BOTTOM_OFFSET = FLOATING_TAB_BAR_INSET - 8;

/** Floating tab bar `bottom` — sits above the home indicator / nav bar. */
export function floatingTabBarBottom(safeAreaBottom: number): number {
  return safeAreaBottom + FLOATING_TAB_BAR_BOTTOM_MARGIN;
}

export function floatingTabBarStyleForSafeArea(safeAreaBottom: number) {
  return {
    ...floatingTabBarStyle,
    bottom: floatingTabBarBottom(safeAreaBottom),
  };
}

/** Scene padding when the tab bar is hidden (side menu is primary navigation). */
export const SHELL_SCENE_CONTAINER_STYLE = {
  paddingBottom: 16,
  backgroundColor: "transparent" as const,
};

/** Full-screen stack content (web teacher/parent navigators). */
export const WEB_SHELL_CONTENT_STYLE = {
  flex: 1,
  backgroundColor: "transparent" as const,
};

export const hiddenTabBarStyle = {
  display: "none" as const,
};

export const floatingTabBarStyle = {
  position: "absolute" as const,
  left: FLOATING_TAB_BAR_HORIZONTAL_MARGIN,
  right: FLOATING_TAB_BAR_HORIZONTAL_MARGIN,
  bottom: FLOATING_TAB_BAR_BOTTOM_MARGIN,
  height: 58,
  borderRadius: 20,
  backgroundColor: "white",
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 16,
  zIndex: 100,
  paddingBottom: 6,
  paddingTop: 6,
  paddingHorizontal: 8,
};

export const tabSceneContainerStyle = {
  paddingBottom: FLOATING_TAB_BAR_INSET,
  backgroundColor: "transparent" as const,
};

/** Used on web tab bar (see tabBar.web.ts); exported here for shared imports. */
export const tabBarItemStyle = {
  paddingVertical: 2,
  minWidth: 0,
};

export const tabBarLabelStyle = {
  fontSize: 11,
  fontWeight: "600" as const,
  marginTop: 2,
};
