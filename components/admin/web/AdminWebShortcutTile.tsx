import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSchoolTheme } from "../../../src/context/schoolThemeContext";

type AdminWebShortcutTileProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  /** Even rows use accent; odd rows use primary (reference layout). */
  rowIndex: number;
  subtitle?: string;
};

export function AdminWebShortcutTile({
  label,
  icon,
  onPress,
  rowIndex,
  subtitle,
}: AdminWebShortcutTileProps) {
  const { theme, fontFamily } = useSchoolTheme();
  const [hovered, setHovered] = useState(false);
  const baseIsPrimary = rowIndex % 2 === 1;
  const bg = hovered
    ? baseIsPrimary
      ? theme.accentColor
      : theme.primaryColor
    : baseIsPrimary
      ? theme.primaryColor
      : theme.accentColor;

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: bg,
          transform: [{ scale: pressed ? 0.98 : hovered ? 1.02 : 1 }],
          ...(Platform.OS === "web"
            ? ({
                cursor: "pointer",
                transitionProperty: "transform, background-color, box-shadow",
                transitionDuration: "160ms",
                transitionTimingFunction: "ease-out",
                boxShadow: hovered
                  ? `0 12px 28px ${bg}66`
                  : `0 4px 14px rgba(15, 23, 42, 0.12)`,
              } as object)
            : null),
        },
      ]}
    >
      <View style={styles.foreground}>
        <Ionicons name={icon} size={22} color="#FFFFFF" />
        <View style={styles.textBlock}>
          <Text
            style={[styles.label, fontFamily ? { fontFamily } : null]}
            numberOfLines={2}
          >
            {label}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <Ionicons
        name={icon}
        size={72}
        color="rgba(255,255,255,0.18)"
        style={styles.watermark}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    minHeight: 88,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    overflow: "hidden",
    justifyContent: "center",
  },
  foreground: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 1,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  subtitle: {
    marginTop: 2,
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    fontWeight: "600",
  },
  watermark: {
    position: "absolute",
    right: 8,
    bottom: 4,
    zIndex: 0,
  },
});
