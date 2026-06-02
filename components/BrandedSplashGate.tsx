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
  const [appUnlocked, setAppUnlocked] = useState(isWeb);
  const [overlayVisible, setOverlayVisible] = useState(!isWeb);

  useEffect(() => {
    if (isWeb) return;
    void SplashScreen.hideAsync().catch(() => {
      /* ignore */
    });
  }, [isWeb]);

  useEffect(() => {
    if (schoolReady) {
      setAppUnlocked(true);
    }
  }, [schoolReady]);

  useEffect(() => {
    if (isWeb) return;
    const timer = setTimeout(() => setAppUnlocked(true), 10000);
    return () => clearTimeout(timer);
  }, [isWeb]);

  useEffect(() => {
    if (!appUnlocked) return;
    const timer = setTimeout(() => setOverlayVisible(false), isWeb ? 0 : 150);
    return () => clearTimeout(timer);
  }, [appUnlocked, isWeb]);

  if (isWeb) {
    if (!schoolReady) {
      return (
        <View style={styles.webLoading}>
          <ActivityIndicator color="#FFFFFF" size="large" />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      );
    }
    return <>{children}</>;
  }

  return (
    <View style={styles.root}>
      {appUnlocked ? children : null}
      {overlayVisible ? (
        <View style={styles.overlay}>
          <ImageBackground
            source={require("../assets/images/splash-icon.png")}
            style={styles.background}
            resizeMode="cover"
            accessibilityLabel="eduTrack"
          >
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" size="large" />
              <Text style={styles.loadingText}>
                {schoolsLoading
                  ? t("common.loading")
                  : error
                    ? t("common.error")
                    : t("common.loading")}
              </Text>
            </View>
          </ImageBackground>
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
    backgroundColor: "#6B9FD4",
    zIndex: 9999,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    paddingBottom: 48,
  },
  loadingRow: {
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  webLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#6B9FD4",
  },
});
