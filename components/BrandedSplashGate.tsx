import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSchoolContext } from "../src/context/schoolContext";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* Expo Go may reject; in-app splash still shows below. */
});

type BrandedSplashGateProps = {
  children: ReactNode;
};

/**
 * Shows the eduTrack splash art until the school session is ready, then reveals the app.
 * Works in Expo Go (which ignores app.json splash) and in release APKs.
 */
export function BrandedSplashGate({ children }: BrandedSplashGateProps) {
  const { schoolReady } = useSchoolContext();
  const [appVisible, setAppVisible] = useState(false);

  const hideSplash = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch {
      /* ignore */
    }
    setAppVisible(true);
  }, []);

  useEffect(() => {
    if (schoolReady) {
      void hideSplash();
    }
  }, [schoolReady, hideSplash]);

  return (
    <View style={styles.root}>
      {children}
      {!appVisible ? (
        <View style={styles.overlay} pointerEvents="none">
          <Image
            source={require("../assets/images/splash-icon.png")}
            style={styles.image}
            contentFit="cover"
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
