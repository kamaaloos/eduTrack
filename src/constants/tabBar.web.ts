/** Web tab bar — compact centered pill (not full-width). */

export const WEB_TAB_BAR_MAX_WIDTH = 520;

export const FLOATING_TAB_BAR_HEIGHT = 64;
export const FLOATING_TAB_BAR_BOTTOM_MARGIN = 16;

/** Space above the floating tab bar (bar height + bottom offset). */
export const FLOATING_TAB_BAR_INSET = 96;

export const STUDENT_COPYRIGHT_BOTTOM_OFFSET = FLOATING_TAB_BAR_INSET - 8;

export function floatingTabBarBottom(_safeAreaBottom: number): number {
  return FLOATING_TAB_BAR_BOTTOM_MARGIN;
}

export function floatingTabBarStyleForSafeArea(_safeAreaBottom: number) {
  return floatingTabBarStyle;
}

/** Stack/tab scene — transparent so RoleAppFrame gradient shows through. */
export const WEB_SHELL_CONTENT_STYLE = {
  flex: 1,
  backgroundColor: "transparent" as const,
};

export const SHELL_SCENE_CONTAINER_STYLE = {
  paddingBottom: 16,
  ...WEB_SHELL_CONTENT_STYLE,
};

export const hiddenTabBarStyle = {
  display: "none" as const,
};

export const floatingTabBarStyle = {
  position: "absolute" as const,
  bottom: 16,
  left: 0,
  right: 0,
  width: WEB_TAB_BAR_MAX_WIDTH,
  maxWidth: "92%" as const,
  marginLeft: "auto" as const,
  marginRight: "auto" as const,
  height: 64,
  borderRadius: 32,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.12)",
  paddingTop: 6,
  paddingBottom: 6,
  paddingHorizontal: 4,
};

export const tabBarItemStyle = {
  paddingVertical: 2,
  minWidth: 0,
};

export const tabBarLabelStyle = {
  fontSize: 11,
  fontWeight: "600" as const,
  marginTop: 2,
};

export const tabBarActiveTintColor = "#1D4ED8";
export const tabBarInactiveTintColor = "#64748B";

export const tabSceneContainerStyle = {
  paddingBottom: FLOATING_TAB_BAR_INSET,
  backgroundColor: "transparent" as const,
};
