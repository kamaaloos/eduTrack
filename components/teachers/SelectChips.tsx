import { useState } from "react";
import { Platform, StyleSheet, Text, Pressable, View } from "react-native";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";

export type ChipOption = {
  value: string;
  label: string;
};

type SelectChipsProps = {
  options: ChipOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  emptyMessage?: string;
};

function ChipButton({
  label,
  active,
  onPress,
  primaryColor,
  accentColor,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  primaryColor: string;
  accentColor: string;
}) {
  const [hovered, setHovered] = useState(false);
  const bg = active
    ? hovered
      ? accentColor
      : primaryColor
    : hovered
      ? "#E2E8F0"
      : "#E5E7EB";

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: bg,
          ...(Platform.OS === "web"
            ? ({
                cursor: "pointer",
                transitionProperty: "background-color, transform",
                transitionDuration: "150ms",
                transform: [{ scale: pressed ? 0.98 : hovered ? 1.02 : 1 }],
              } as object)
            : null),
        },
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SelectChips({
  options,
  selectedValue,
  onSelect,
  emptyMessage = "Nothing to select",
}: SelectChipsProps) {
  const { theme } = useSchoolTheme();

  if (options.length === 0) {
    return <Text style={styles.empty}>{emptyMessage}</Text>;
  }

  const chips = options.map((opt) => (
    <ChipButton
      key={opt.value}
      label={opt.label}
      active={selectedValue === opt.value}
      onPress={() => onSelect(opt.value)}
      primaryColor={theme.primaryColor}
      accentColor={theme.accentColor}
    />
  ));

  // Wrapped row on all platforms — horizontal ScrollView inside flex:1 layouts stretches
  // chips to full screen height on Android; nested horizontal scroll also breaks taps on web/iOS.
  return <View style={styles.wrapRow}>{chips}</View>;
}

/** Vertical list — reliable on iOS inside ScrollView */
export function SelectList({
  options,
  selectedValue,
  onSelect,
  emptyMessage = "Nothing to select",
}: SelectChipsProps) {
  const { theme } = useSchoolTheme();

  if (options.length === 0) {
    return <Text style={styles.empty}>{emptyMessage}</Text>;
  }

  return (
    <View style={styles.list}>
      {options.map((opt) => {
        const active = selectedValue === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={({ pressed }) => [
              styles.listItem,
              active
                ? {
                    backgroundColor: `${theme.primaryColor}14`,
                    borderColor: theme.primaryColor,
                  }
                : null,
              pressed && styles.chipPressed,
            ]}
          >
            <Text
              style={[
                styles.listItemText,
                active
                  ? { color: theme.primaryColor, fontWeight: "700" }
                  : null,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 4,
    flexGrow: 0,
    alignSelf: "flex-start",
    width: "100%",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 14,
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  empty: {
    color: "#6B7280",
    fontSize: 14,
    paddingVertical: 8,
  },
  list: {},
  listItem: {
    backgroundColor: "#F3F4F6",
    paddingVertical: Platform.OS === "web" ? 12 : 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
    minHeight: Platform.OS === "web" ? undefined : 48,
  },
  listItemText: {
    fontSize: Platform.OS === "web" ? 15 : 16,
    fontWeight: "600",
    color: "#374151",
    lineHeight: Platform.OS === "web" ? 20 : 22,
  },
});
