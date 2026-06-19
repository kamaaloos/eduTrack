import type { ReactNode } from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import {
  webAuthCardStyle,
  webContentCardStyle,
  webPageCardFrameStyle,
  webPageFrameStyle,
  webRoleSidebarPageCardStyle,
  webWideCardStyle,
} from "../../src/constants/platformLayout";

type WebPageCardProps = {
  children: ReactNode;
  style?: ViewStyle;
  /** Narrow card for login / about; content for FAQ; wide for full-width pages */
  variant?: "auth" | "content" | "wide";
  fill?: boolean;
};

/** Centered white card for a single screen's main content (auth, about, contact). */
export function WebPageCard({
  children,
  style,
  variant = "auth",
  fill,
}: WebPageCardProps) {
  const layout = usePlatformLayout();

  if (!layout.isWeb) {
    return <>{children}</>;
  }

  return (
    <View
      style={[
        styles.card,
        variant === "wide"
          ? webWideCardStyle(layout)
          : variant === "content"
            ? webContentCardStyle(layout)
            : webAuthCardStyle(layout),
        fill && styles.cardFill,
        style,
      ]}
    >
      {children}
    </View>
  );
}

type WebPageCardFrameProps = {
  children: ReactNode;
  style?: ViewStyle;
  /** Use a narrower centered card on desktop web with a left nav (teacher shells). */
  sidebarLayout?: boolean;
};

/**
 * Full role screen frame on web: gradient backdrop + one large card
 * wrapping header and scrollable body.
 */
export function WebPageCardFrame({
  children,
  style,
  sidebarLayout = false,
}: WebPageCardFrameProps) {
  const layout = usePlatformLayout();

  if (!layout.isWeb) {
    return <>{children}</>;
  }

  return (
    <View style={webPageFrameStyle(layout)}>
      <View
        style={[
          webPageCardFrameStyle(layout),
          sidebarLayout ? webRoleSidebarPageCardStyle(layout) : null,
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function webPageBodyStyle(): ViewStyle | undefined {
  if (Platform.OS !== "web") {
    return undefined;
  }
  return styles.webBody;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    ...(Platform.OS === "web"
      ? ({
          boxShadow:
            "0 16px 48px rgba(15, 23, 42, 0.1), 0 4px 16px rgba(15, 23, 42, 0.06)",
        } as object)
      : null),
  },
  cardFill: {
    flex: 1,
  },
  webBody: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
