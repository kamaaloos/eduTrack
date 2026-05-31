/** Space reserved above the floating tab bar (height + bottom offset + margin). */
export const FLOATING_TAB_BAR_INSET = 110;

/** Scene padding when the tab bar is hidden (side menu is primary navigation). */
export const SHELL_SCENE_CONTAINER_STYLE = {
  paddingBottom: 16,
  backgroundColor: "transparent" as const,
};

export const hiddenTabBarStyle = {
  display: "none" as const,
};

export const floatingTabBarStyle = {
  position: "absolute" as const,
  left: 15,
  right: 15,
  bottom: 15,
  height: 72,
  borderRadius: 24,
  backgroundColor: "white",
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 24,
  zIndex: 100,
  paddingBottom: 10,
  paddingTop: 10,
};

export const tabSceneContainerStyle = {
  paddingBottom: FLOATING_TAB_BAR_INSET,
  backgroundColor: "transparent" as const,
};
