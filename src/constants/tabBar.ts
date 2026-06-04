/** Space reserved above the floating tab bar (height + bottom offset + margin). */
export const FLOATING_TAB_BAR_INSET = 82;

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
  left: 16,
  right: 16,
  bottom: 10,
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
};

export const tabSceneContainerStyle = {
  paddingBottom: FLOATING_TAB_BAR_INSET,
  backgroundColor: "transparent" as const,
};
