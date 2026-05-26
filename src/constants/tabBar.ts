/** Space reserved above the floating tab bar (height + bottom offset + margin). */
export const FLOATING_TAB_BAR_INSET = 110;

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
