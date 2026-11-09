import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { ListPageNav } from "../common/ListPageNav";

export interface SelectableItem {
  id: string;
  name: string;
}

type SingleSelectorProps = {
  title: string;
  items: SelectableItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  selectedIds?: never;
  onChangeSelectedIds?: never;
  multiSelect?: false;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  maxListHeight?: number;
  visibleLimit?: number;
  containerStyle?: ViewStyle;
};

type MultiSelectorProps = {
  title: string;
  items: SelectableItem[];
  selectedId?: never;
  onSelect?: never;
  selectedIds: string[];
  onChangeSelectedIds: (ids: string[]) => void;
  multiSelect: true;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  maxListHeight?: number;
  visibleLimit?: number;
  containerStyle?: ViewStyle;
};

export type SelectorProps = SingleSelectorProps | MultiSelectorProps;

export const Selector: React.FC<SelectorProps> = (props) => {
  const {
    title,
    items,
    disabled = false,
    searchable = false,
    searchPlaceholder,
    maxListHeight = 280,
    visibleLimit = 4,
    containerStyle,
  } = props;
  const multiSelect = props.multiSelect === true;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? t("admin.selectorSearch");

  const selectedIds = multiSelect
    ? props.selectedIds
    : props.selectedId
      ? [props.selectedId]
      : [];

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return items;
    }
    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, searchQuery]);

  const pagination = usePaginatedList(
    filteredItems,
    searchable ? visibleLimit : filteredItems.length || 1,
    searchQuery,
  );
  const displayItems = searchable ? pagination.pageItems : filteredItems;
  const rowHeight = 49;
  const listMaxHeight = searchable
    ? Math.min(maxListHeight, Math.max(visibleLimit, 6) * rowHeight)
    : maxListHeight;

  const buttonLabel = (() => {
    if (selectedItems.length === 0) {
      return multiSelect
        ? t("admin.selectorSelectMany", { title })
        : t("admin.selectorSelect", { title });
    }
    if (!multiSelect) {
      return selectedItems[0]?.name ?? "";
    }
    if (selectedItems.length === 1) {
      return selectedItems[0].name;
    }
    return t("admin.selectorManySelected", { count: selectedItems.length });
  })();

  const toggleId = (id: string) => {
    if (!multiSelect) {
      props.onSelect?.(id);
      setOpen(false);
      setSearchQuery("");
      return;
    }
    const next = selectedIds.includes(id)
      ? selectedIds.filter((itemId) => itemId !== id)
      : [...selectedIds, id];
    props.onChangeSelectedIds(next);
  };

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
    <View style={[styles.container, containerStyle]}>
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
          style={[
            styles.selectorText,
            selectedItems.length === 0 && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {buttonLabel}
        </Text>
        <Text style={styles.selectorIcon}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {multiSelect && selectedItems.length > 0 ? (
        <View style={styles.chips}>
          {selectedItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.chip}
              onPress={() => toggleId(item.id)}
              disabled={disabled}
            >
              <Text style={styles.chipText} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.chipRemove}>×</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

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
            <>
              <ScrollView
                style={{ maxHeight: listMaxHeight }}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                {displayItems.map((item) => {
                  const selected = selectedIds.includes(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.option, selected && styles.selectedOption]}
                      onPress={() => toggleId(item.id)}
                      disabled={disabled}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.selectedOptionText,
                        ]}
                      >
                        {multiSelect ? (selected ? "✓ " : "○ ") : ""}
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {searchable ? (
                <ListPageNav
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  canPrev={pagination.canPrev}
                  canNext={pagination.canNext}
                  onPrev={pagination.prevPage}
                  onNext={pagination.nextPage}
                />
              ) : null}
              {multiSelect ? (
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => {
                    setOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <Text style={styles.doneBtnText}>{t("common.done")}</Text>
                </TouchableOpacity>
              ) : null}
            </>
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
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "100%",
    backgroundColor: "#EFF6FF",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  chipText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  chipRemove: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 16,
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
  doneBtn: {
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  doneBtnText: {
    fontWeight: "700",
    color: "#1D4ED8",
    fontSize: 14,
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
