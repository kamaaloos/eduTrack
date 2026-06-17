import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ClassData } from "../../hooks/useAdminClasses";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";

type AdminClassBrowseListProps = {
  classes: ClassData[];
};

export function AdminClassBrowseList({ classes }: AdminClassBrowseListProps) {
  const { t } = useTranslation();

  const sorted = useMemo(
    () =>
      [...classes].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", undefined, {
          sensitivity: "base",
        }),
      ),
    [classes],
  );

  if (sorted.length === 0) {
    return <Text style={styles.empty}>{t("admin.noClassesFound")}</Text>;
  }

  return (
    <View style={styles.list}>
      {sorted.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.row, index === sorted.length - 1 && styles.rowLast]}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: "/(admin)/class/[classId]",
              params: { classId: item.id },
            })
          }
        >
          <View style={styles.iconWrap}>
            <Ionicons name="school" size={18} color="#D97706" />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {item.name || t("common.classFallback")}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    paddingVertical: 8,
  },
  list: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
});
