import { Image, StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, type ReactNode } from "react";
import { useSchoolContext } from "../src/context/schoolContext";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* Expo Go may reject; in-app splash still shows below. */
});

type BrandedSplashGateProps = {
  children: ReactNode;
};

/**
 * Shows splash art until the school session is ready, then mounts the app tree.
 * Deferring children avoids navigation/auth running under the splash overlay
 * (a common source of release APK crashes on first launch).
 */
export function BrandedSplashGate({ children }: BrandedSplashGateProps) {
  const { schoolReady } = useSchoolContext();
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    if (!schoolReady) return;

    void SplashScreen.hideAsync().catch(() => {
      /* ignore */
    });

    const timer = setTimeout(() => setOverlayVisible(false), 100);
    return () => clearTimeout(timer);
  }, [schoolReady]);

  return (
    <View style={styles.root}>
      {schoolReady ? children : null}
      {overlayVisible ? (
        <View style={styles.overlay} pointerEvents="none">
          <Image
            source={require("../assets/images/splash-icon.png")}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel="eduTrack"
          />
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
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
