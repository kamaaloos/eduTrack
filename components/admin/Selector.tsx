import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface SelectableItem {
  id: string;
  name: string;
}

interface SelectorProps {
  title: string;
  items: SelectableItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  maxListHeight?: number;
}

export const Selector: React.FC<SelectorProps> = ({
  title,
  items,
  selectedId,
  onSelect,
  disabled = false,
  searchable = false,
  searchPlaceholder,
  maxListHeight = 280,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedItem = items.find((item) => item.id === selectedId);
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? t("admin.selectorSearch");

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return items;
    }
    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, searchQuery]);

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {t("admin.selectorNoAvailable", { title: title.toLowerCase() })}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity
        style={[styles.selectorButton, disabled && styles.disabledButton]}
        onPress={() => {
          if (!disabled) {
            setOpen((current) => {
              if (current) {
                setSearchQuery("");
              }
              return !current;
            });
          }
        }}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.selectorText, !selectedItem && styles.placeholderText]}
          numberOfLines={1}
        >
          {selectedItem
            ? selectedItem.name
            : t("admin.selectorSelect", { title })}
        </Text>
        <Text style={styles.selectorIcon}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.optionsContainer}>
          {searchable ? (
            <TextInput
              style={styles.searchInput}
              placeholder={resolvedSearchPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />
          ) : null}

          {filteredItems.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>
                {t("admin.selectorNoMatches")}
              </Text>
            </View>
          ) : (
            <ScrollView
              style={{ maxHeight: maxListHeight }}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {filteredItems.map((item) => {
                const selected = selectedId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.option, selected && styles.selectedOption]}
                    onPress={() => {
                      onSelect(item.id);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    disabled={disabled}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.selectedOptionText,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    color: "#1F2937",
  },
  selectorButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  selectorText: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    marginRight: 12,
  },
  placeholderText: {
    color: "#6B7280",
  },
  selectorIcon: {
    color: "#6B7280",
    fontSize: 12,
  },
  optionsContainer: {
    marginTop: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    overflow: "hidden",
  },
  searchInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  noResults: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  noResultsText: {
    color: "#6B7280",
    fontSize: 14,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "white",
  },
  selectedOption: {
    backgroundColor: "#EFF6FF",
  },
  optionText: {
    fontSize: 15,
    color: "#111827",
  },
  selectedOptionText: {
    color: "#1D4ED8",
    fontWeight: "700",
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
  },
});
