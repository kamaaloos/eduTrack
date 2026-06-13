import type { ReactNode } from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import {
  WEB_AUTH_MAX_WIDTH,
  WEB_PAGE_CARD_MAX_WIDTH,
} from "../../src/constants/webLayout";

const webCardShadow =
  Platform.OS === "web"
    ? ({
        boxShadow:
          "0 16px 48px rgba(15, 23, 42, 0.1), 0 4px 16px rgba(15, 23, 42, 0.06)",
      } as object)
    : null;

type WebPageCardProps = {
  children: ReactNode;
  style?: ViewStyle;
  /** Narrow card for login / about; wide for standalone content */
  variant?: "auth" | "wide";
  fill?: boolean;
};

/** Centered white card for a single screen's main content (auth, about, contact). */
export function WebPageCard({
  children,
  style,
  variant = "auth",
  fill,
}: WebPageCardProps) {
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  return (
    <View
      style={[
        styles.card,
        variant === "wide" ? styles.cardWide : styles.cardAuth,
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
};

/**
 * Full role screen frame on web: gradient backdrop + one large card
 * wrapping header and scrollable body.
 */
export function WebPageCardFrame({ children, style }: WebPageCardFrameProps) {
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  return (
    <View style={styles.frame}>
      <View style={[styles.frameCard, style]}>{children}</View>
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
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    ...webCardShadow,
  },
  cardAuth: {
    maxWidth: WEB_AUTH_MAX_WIDTH,
    alignSelf: "center",
  },
  cardWide: {
    maxWidth: WEB_PAGE_CARD_MAX_WIDTH,
    alignSelf: "center",
  },
  cardFill: {
    flex: 1,
  },
  frame: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  frameCard: {
    flex: 1,
    width: "100%",
    maxWidth: WEB_PAGE_CARD_MAX_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    minHeight: 0,
    ...webCardShadow,
  },
  webBody: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
