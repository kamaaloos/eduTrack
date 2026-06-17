import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useSchoolContext } from "../src/context/schoolContext";
import { APP_DISPLAY_NAME } from "../src/constants/brand";

/** Full-screen splash artwork (logo, decorative shapes, loading tagline). */
export const APP_SPLASH = require("../assets/images/splash-screen.png");

SplashScreen.preventAutoHideAsync().catch(() => {
  /* Expo Go may reject; in-app splash still shows below. */
});

type BrandedSplashGateProps = {
  children: ReactNode;
};

/**
 * Full-screen branded splash until the school session is ready (or timeout).
 * Hides the native splash immediately so Android does not show a tiny centered icon.
 */
export function BrandedSplashGate({ children }: BrandedSplashGateProps) {
  const { t } = useTranslation();
  const { schoolReady, schoolsLoading, error } = useSchoolContext();
  const isWeb = Platform.OS === "web";
  const [overlayVisible, setOverlayVisible] = useState(!isWeb);

  useEffect(() => {
    if (isWeb) return;
    void SplashScreen.hideAsync().catch(() => {
      /* ignore */
    });
  }, [isWeb]);

  useEffect(() => {
    if (isWeb) return;
    if (!schoolReady) {
      const timer = setTimeout(() => setOverlayVisible(false), 10_000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setOverlayVisible(false), 150);
    return () => clearTimeout(timer);
  }, [schoolReady, isWeb]);

  const splash = (
    <ImageBackground
      source={APP_SPLASH}
      style={styles.background}
      resizeMode="cover"
      accessibilityLabel={APP_DISPLAY_NAME}
    />
  );

  if (isWeb) {
    if (!schoolReady) {
      return (
        <View style={styles.webRoot}>
          {splash}
          <View style={styles.webLoading}>
            <ActivityIndicator color="#2563EB" size="large" />
            <Text style={styles.webLoadingText}>
              {schoolsLoading
                ? t("common.loading")
                : error
                  ? t("common.error")
                  : t("common.loading")}
            </Text>
          </View>
        </View>
      );
    }
    return <>{children}</>;
  }

  return (
    <View style={styles.root}>
      {children}
      {overlayVisible ? (
        <View style={styles.overlay} pointerEvents="auto">
          {splash}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    zIndex: 9999,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  webRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  webLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 48,
    gap: 12,
  },
  webLoadingText: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "600",
  },
});
