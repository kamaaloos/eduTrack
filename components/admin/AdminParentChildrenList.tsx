import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { ParentChild } from "../../src/services/parentChildren";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";

type AdminParentChildrenListProps = {
  linkedChildren: ParentChild[];
  loading?: boolean;
};

export function AdminParentChildrenList({
  linkedChildren,
  loading = false,
}: AdminParentChildrenListProps) {
  const { t } = useTranslation();

  if (loading) {
    return <ActivityIndicator color="#7C3AED" style={styles.loader} />;
  }

  if (linkedChildren.length === 0) {
    return <Text style={styles.empty}>{t("admin.parentDetailNoChildren")}</Text>;
  }

  return (
    <View style={styles.list}>
      <View style={styles.tableHead}>
        <Text style={[styles.th, styles.colChild]}>{t("admin.students")}</Text>
        <Text style={[styles.th, styles.colClass]}>{t("common.class")}</Text>
      </View>
      {linkedChildren.map((child, index) => (
        <View
          key={child.id}
          style={[styles.row, index === linkedChildren.length - 1 && styles.rowLast]}
        >
          <Text style={[styles.childName, styles.colChild]} numberOfLines={2}>
            {child.name}
          </Text>
          <Text style={[styles.className, styles.colClass]} numberOfLines={2}>
            {child.className || child.classId || "—"}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    backgroundColor: "#F8FAFC",
    overflow: "hidden",
  },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  th: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 12,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  colChild: {
    flex: 1.2,
    minWidth: 0,
  },
  colClass: {
    flex: 1,
    minWidth: 0,
  },
  childName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  className: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    color: "#94A3B8",
  },
  loader: {
    marginVertical: 12,
  },
});
