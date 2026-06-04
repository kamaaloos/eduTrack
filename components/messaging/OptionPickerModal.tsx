import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { ChipOption } from "../teachers/SelectChips";

const isWeb = Platform.OS === "web";

type OptionPickerModalProps = {
  visible: boolean;
  title: string;
  options: ChipOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  loading?: boolean;
  emptyMessage?: string;
};

export function OptionPickerModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  loading = false,
  emptyMessage,
}: OptionPickerModalProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, search]);

  const handleClose = () => {
    setSearch("");
    onClose();
  };

  const handleSelect = (value: string) => {
    setSearch("");
    onSelect(value);
  };

  return (
    <Modal
      visible={visible}
      animationType={isWeb ? "fade" : "slide"}
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={12}>
              <Ionicons name="close" size={26} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.search}
            placeholder={t("directMessage.search")}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            editable={!loading}
          />

          {loading ? (
            <ActivityIndicator
              color="#1E3A8A"
              style={styles.loader}
              size="large"
            />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              renderItem={({ item }) => {
                const active = item.value === selectedValue;
                return (
                  <Pressable
                    style={[styles.item, active && styles.itemActive]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text
                      style={[styles.itemText, active && styles.itemTextActive]}
                      numberOfLines={2}
                    >
                      {item.label}
                    </Text>
                    {active ? (
                      <Ionicons name="checkmark-circle" size={22} color="#2563EB" />
                    ) : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.empty}>
                  {emptyMessage ?? t("directMessage.noMatch")}
                </Text>
              }
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: isWeb ? "center" : "flex-end",
    alignItems: isWeb ? "center" : "stretch",
    padding: isWeb ? 24 : 0,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    width: isWeb ? ("100%" as const) : undefined,
    maxWidth: isWeb ? 480 : undefined,
    alignSelf: isWeb ? "center" : undefined,
    borderRadius: isWeb ? 16 : undefined,
    borderTopLeftRadius: isWeb ? 16 : 20,
    borderTopRightRadius: isWeb ? 16 : 20,
    maxHeight: isWeb ? ("min(70vh, 560px)" as const) : "75%",
    paddingBottom: 24,
    ...(isWeb
      ? ({
          boxShadow: "0 12px 40px rgba(15, 23, 42, 0.2)",
        } as object)
      : null),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
    marginRight: 12,
  },
  search: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  list: {
    paddingHorizontal: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#F8FAFC",
  },
  itemActive: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginRight: 8,
  },
  itemTextActive: {
    color: "#1D4ED8",
  },
  empty: {
    textAlign: "center",
    color: "#64748B",
    paddingVertical: 24,
    fontSize: 15,
  },
  loader: {
    paddingVertical: 40,
  },
});
