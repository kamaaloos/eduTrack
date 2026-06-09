import { Platform, StyleSheet, View, type ViewStyle } from "react-native";

type WebAppShellProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

/** Full-viewport wrapper on web; no-op on native. */
export function WebAppShell({ children, style }: WebAppShellProps) {
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  return <View style={[styles.webRoot, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    width: "100%",
    minHeight: "100%",
    alignSelf: "stretch",
  },
});
