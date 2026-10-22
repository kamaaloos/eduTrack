import { useState, type ReactNode } from "react";
import {
  Platform,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { adminDirectoryTableRowStyle } from "../../src/constants/platformLayout";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";

type AdminDirectoryTableRowProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

/** Desktop directory table row with school-theme hover lift. */
export function AdminDirectoryTableRow({
  children,
  style,
  onPress,
}: AdminDirectoryTableRowProps) {
  const { theme } = useSchoolTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        adminDirectoryTableRowStyle(),
        {
          backgroundColor: hovered ? `${theme.primaryColor}14` : "transparent",
          borderRadius: 10,
          borderBottomColor: hovered ? `${theme.accentColor}66` : "#F1F5F9",
          transform: [
            { scale: pressed && onPress ? 0.995 : hovered ? 1.012 : 1 },
          ],
          ...(Platform.OS === "web"
            ? ({
                cursor: onPress ? "pointer" : "default",
                transitionProperty:
                  "background-color, transform, box-shadow, border-color",
                transitionDuration: "160ms",
                transitionTimingFunction: "ease-out",
                boxShadow: hovered
                  ? `0 8px 18px ${theme.primaryColor}28`
                  : "0 0 0 transparent",
              } as object)
            : null),
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

type AdminDirectoryHoverSurfaceProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Soft theme hover for directory cards / list surfaces on web. */
export function AdminDirectoryHoverSurface({
  children,
  style,
}: AdminDirectoryHoverSurfaceProps) {
  const { theme } = useSchoolTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        style,
        {
          transform: [{ scale: hovered ? 1.015 : 1 }],
          ...(Platform.OS === "web"
            ? ({
                transitionProperty: "transform, box-shadow, border-color",
                transitionDuration: "160ms",
                transitionTimingFunction: "ease-out",
                borderColor: hovered ? theme.accentColor : undefined,
                boxShadow: hovered
                  ? `0 10px 22px ${theme.primaryColor}30`
                  : undefined,
              } as object)
            : null),
        },
      ]}
    >
      {children}
    </Pressable>
  );
}
