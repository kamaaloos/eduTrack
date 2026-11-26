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
  /**
   * Compact 3-up tiles (teacher dashboard): icon above label, single-line
   * text that shrinks to fit.
   */
  compact?: boolean;
};

export function AdminWebShortcutTile({
  label,
  icon,
  onPress,
  rowIndex,
  subtitle,
  compact = false,
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
        compact ? styles.tileCompact : null,
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
      <View
        style={[styles.foreground, compact ? styles.foregroundCompact : null]}
      >
        <Ionicons name={icon} size={compact ? 20 : 22} color="#FFFFFF" />
        <View
          style={[styles.textBlock, compact ? styles.textBlockCompact : null]}
        >
          <Text
            style={[
              styles.label,
              compact ? styles.labelCompact : null,
              fontFamily ? { fontFamily } : null,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            ellipsizeMode="tail"
          >
            {label}
          </Text>
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                compact ? styles.subtitleCompact : null,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <Ionicons
        name={icon}
        size={compact ? 56 : 72}
        color="rgba(255,255,255,0.18)"
        style={[styles.watermark, compact ? styles.watermarkCompact : null]}
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
  tileCompact: {
    minHeight: 96,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  foreground: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 1,
  },
  foregroundCompact: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  textBlockCompact: {
    flex: 0,
    width: "100%",
    alignItems: "center",
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  labelCompact: {
    fontSize: 13,
    lineHeight: 16,
    textAlign: "center",
    width: "100%",
  },
  subtitle: {
    marginTop: 2,
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    fontWeight: "600",
  },
  subtitleCompact: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 12,
    textAlign: "center",
    width: "100%",
  },
  watermark: {
    position: "absolute",
    right: 8,
    bottom: 4,
    zIndex: 0,
  },
  watermarkCompact: {
    right: 2,
    bottom: 0,
    opacity: 0.9,
  },
});
