import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { WEB_PAGE_BACKGROUND_STYLE } from "../../src/constants/webBackground";

type WebIconFontGateProps = {
  children: ReactNode;
};

/**
 * Preloads Ionicons on web so login and headers do not hit fontfaceobserver timeouts.
 * If loading fails, still renders children (icons may be missing briefly).
 */
export function WebIconFontGate({ children }: WebIconFontGateProps) {
  const [ready, setReady] = useState(Platform.OS !== "web");

  useEffect(() => {
    if (Platform.OS !== "web") return;

    let cancelled = false;

    const finish = () => {
      if (!cancelled) setReady(true);
    };

    const timeout = setTimeout(finish, 8000);

    void Ionicons.loadFont()
      .catch(() => {
        /* Font CDN blocked or slow — app should still run */
      })
      .finally(() => {
        clearTimeout(timeout);
        finish();
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web" ? WEB_PAGE_BACKGROUND_STYLE : { backgroundColor: "#6B9FD4" }),
  },
});
