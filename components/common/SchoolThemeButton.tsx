import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";

export type SchoolThemeButtonProps = {
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
  /** Compact dialog-style padding */
  size?: "default" | "compact";
};

/** Primary CTA: school primary fill, accent + lift on hover (login Sign in pattern). */
export function SchoolThemeButton({
  onPress,
  disabled = false,
  loading = false,
  label,
  children,
  style,
  textStyle,
  testID,
  size = "default",
}: SchoolThemeButtonProps) {
  const { theme, fontFamily } = useSchoolTheme();
  const [hovered, setHovered] = useState(false);
  const busy = disabled || loading;
  const bg = hovered && !busy ? theme.accentColor : theme.primaryColor;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: busy }}
      onPress={onPress}
      disabled={busy}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.base,
        size === "compact" ? styles.compact : styles.default,
        {
          backgroundColor: bg,
          opacity: busy ? 0.6 : 1,
          transform: [
            {
              scale: busy ? 1 : pressed ? 0.98 : hovered ? 1.03 : 1,
            },
          ],
          ...(Platform.OS === "web"
            ? ({
                cursor: busy ? "default" : "pointer",
                transitionProperty: "transform, box-shadow, background-color",
                transitionDuration: "180ms",
                transitionTimingFunction: "ease-out",
                boxShadow: hovered && !busy
                  ? `0 14px 32px ${theme.accentColor}66`
                  : `0 8px 24px ${theme.primaryColor}40`,
              } as object)
            : {
                shadowColor: hovered && !busy ? theme.accentColor : theme.primaryColor,
                shadowOpacity: 0.25,
                shadowRadius: hovered ? 12 : 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: hovered ? 6 : 3,
              }),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : children ? (
        children
      ) : (
        <Text
          style={[
            styles.label,
            fontFamily ? { fontFamily } : null,
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

/** Dynamic primary/accent colors + hover handlers for custom Pressables. */
export function useSchoolThemePrimaryPressable() {
  const { theme, fontFamily } = useSchoolTheme();
  const [hovered, setHovered] = useState(false);

  return {
    theme,
    fontFamily,
    hovered,
    onHoverIn: () => setHovered(true),
    onHoverOut: () => setHovered(false),
    backgroundColor: hovered ? theme.accentColor : theme.primaryColor,
    pressableStyle: (pressed: boolean, disabled?: boolean): ViewStyle => {
      const busy = Boolean(disabled);
      const bg = hovered && !busy ? theme.accentColor : theme.primaryColor;
      return {
        backgroundColor: bg,
        opacity: busy ? 0.6 : 1,
        transform: [
          { scale: busy ? 1 : pressed ? 0.98 : hovered ? 1.03 : 1 },
        ],
        ...(Platform.OS === "web"
          ? ({
              cursor: busy ? "default" : "pointer",
              transitionProperty: "transform, box-shadow, background-color",
              transitionDuration: "180ms",
              transitionTimingFunction: "ease-out",
              boxShadow:
                hovered && !busy
                  ? `0 14px 32px ${theme.accentColor}66`
                  : `0 8px 24px ${theme.primaryColor}40`,
            } as ViewStyle)
          : {
              shadowColor:
                hovered && !busy ? theme.accentColor : theme.primaryColor,
            }),
      };
    },
  };
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  default: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  compact: {
    minWidth: 96,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
