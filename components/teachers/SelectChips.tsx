import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";

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
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
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
  if (options.length === 0) {
    return <Text style={styles.empty}>{emptyMessage}</Text>;
  }

  const chips = options.map((opt) => (
    <ChipButton
      key={opt.value}
      label={opt.label}
      active={selectedValue === opt.value}
      onPress={() => onSelect(opt.value)}
    />
  ));

  // iOS: avoid horizontal ScrollView inside parent ScrollView (breaks touches)
  if (Platform.OS === "ios") {
    return <View style={styles.wrapRow}>{chips}</View>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      nestedScrollEnabled
    >
      {chips}
    </ScrollView>
  );
}

/** Vertical list — reliable on iOS inside ScrollView */
export function SelectList({
  options,
  selectedValue,
  onSelect,
  emptyMessage = "Nothing to select",
}: SelectChipsProps) {
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
              active && styles.listItemActive,
              pressed && styles.chipPressed,
            ]}
          >
            <Text
              style={[styles.listItemText, active && styles.listItemTextActive]}
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
  row: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: "#2563EB",
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
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  listItemActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  listItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  listItemTextActive: {
    color: "#1D4ED8",
  },
});
