import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";

type FlowerSpec = {
  key: string;
  leftPct: number;
  size: number;
  delayMs: number;
  durationMs: number;
  drift: number;
  opacity: number;
};

const FLOWERS: FlowerSpec[] = [
  { key: "f1", leftPct: 8, size: 18, delayMs: 0, durationMs: 4200, drift: 10, opacity: 0.35 },
  { key: "f2", leftPct: 22, size: 14, delayMs: 700, durationMs: 4800, drift: -12, opacity: 0.28 },
  { key: "f3", leftPct: 38, size: 22, delayMs: 300, durationMs: 5200, drift: 8, opacity: 0.4 },
  { key: "f4", leftPct: 55, size: 16, delayMs: 1100, durationMs: 4500, drift: -9, opacity: 0.3 },
  { key: "f5", leftPct: 70, size: 20, delayMs: 500, durationMs: 5000, drift: 14, opacity: 0.36 },
  { key: "f6", leftPct: 86, size: 15, delayMs: 900, durationMs: 4600, drift: -7, opacity: 0.26 },
];

function RisingFlower({
  flower,
  color,
}: {
  flower: FlowerSpec;
  color: string;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(flower.delayMs),
        Animated.timing(progress, {
          toValue: 1,
          duration: flower.durationMs,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [flower.delayMs, flower.durationMs, progress]);

  const style = useMemo(
    () => ({
      left: `${flower.leftPct}%` as `${number}%`,
      opacity: progress.interpolate({
        inputRange: [0, 0.15, 0.7, 1],
        outputRange: [0, flower.opacity, flower.opacity * 0.85, 0],
      }),
      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [28, -110],
          }),
        },
        {
          translateX: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, flower.drift],
          }),
        },
        {
          rotate: progress.interpolate({
            inputRange: [0, 1],
            outputRange: ["-12deg", "18deg"],
          }),
        },
        {
          scale: progress.interpolate({
            inputRange: [0, 0.35, 1],
            outputRange: [0.6, 1, 1.15],
          }),
        },
      ],
    }),
    [flower, progress],
  );

  return (
    <Animated.View style={[styles.flower, style]} pointerEvents="none">
      <Ionicons name="flower" size={flower.size} color={color} />
    </Animated.View>
  );
}

/** Soft rising flowers behind welcome-card copy (web dashboard hero). */
export function WelcomeFlowerRise({ accentColor }: { accentColor: string }) {
  return (
    <View style={styles.layer} pointerEvents="none">
      {FLOWERS.map((flower) => (
        <RisingFlower
          key={flower.key}
          flower={flower}
          color="rgba(255,255,255,0.55)"
        />
      ))}
      {FLOWERS.slice(0, 3).map((flower) => (
        <RisingFlower
          key={`a-${flower.key}`}
          flower={{
            ...flower,
            key: `a-${flower.key}`,
            leftPct: flower.leftPct + 6,
            delayMs: flower.delayMs + 1400,
            size: flower.size - 2,
          }}
          color={accentColor}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: 0,
  },
  flower: {
    position: "absolute",
    bottom: 8,
  },
});
