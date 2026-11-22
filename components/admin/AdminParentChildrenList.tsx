import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ParentChild } from "../../src/services/parentChildren";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import { AdminDirectoryTableRow } from "./AdminDirectoryTableRow";

type AdminParentChildrenListProps = {
  linkedChildren: ParentChild[];
  loading?: boolean;
  actionsDisabled?: boolean;
  onEdit?: (child: ParentChild) => void;
  onUnlink?: (child: ParentChild) => void;
  onDelete?: (child: ParentChild) => void;
};

export function AdminParentChildrenList({
  linkedChildren,
  loading = false,
  actionsDisabled = false,
  onEdit,
  onUnlink,
  onDelete,
}: AdminParentChildrenListProps) {
  const { t } = useTranslation();
  const showActions = Boolean(onEdit || onUnlink || onDelete);

  if (loading) {
    return <ActivityIndicator color="#2563EB" style={styles.loader} />;
  }

  if (linkedChildren.length === 0) {
    return <Text style={styles.empty}>{t("admin.parentDetailNoChildren")}</Text>;
  }

  return (
    <View style={styles.list}>
      <View style={styles.tableHead}>
        <Text style={[styles.th, styles.colChild]}>{t("admin.students")}</Text>
        <Text style={[styles.th, styles.colClass]}>{t("common.class")}</Text>
        {showActions ? (
          <Text style={[styles.th, styles.colActions]}>
            {t("admin.directoryActionsColumn")}
          </Text>
        ) : null}
      </View>
      {linkedChildren.map((child, index) => (
        <View
          key={child.id}
          style={[styles.rowWrap, index === linkedChildren.length - 1 && styles.rowLast]}
        >
          <AdminDirectoryTableRow style={[styles.row, styles.rowMain]}>
            <Text style={[styles.childName, styles.colChild]} numberOfLines={2}>
              {child.name}
            </Text>
            <Text style={[styles.className, styles.colClass]} numberOfLines={2}>
              {child.className || child.classId || "—"}
            </Text>
          </AdminDirectoryTableRow>
          {showActions ? (
            <View style={styles.actions}>
              {onEdit ? (
                <Pressable
                  onPress={() => {
                    if (!actionsDisabled) onEdit(child);
                  }}
                  disabled={actionsDisabled}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={t("admin.parentChildEditA11y", {
                    name: child.name,
                  })}
                  style={styles.actionBtn}
                >
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={actionsDisabled ? "#CBD5E1" : "#2563EB"}
                  />
                </Pressable>
              ) : null}
              {onUnlink ? (
                <Pressable
                  onPress={() => {
                    if (!actionsDisabled) onUnlink(child);
                  }}
                  disabled={actionsDisabled}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={t("admin.parentChildUnlinkA11y", {
                    name: child.name,
                  })}
                  style={styles.actionBtn}
                >
                  <Ionicons
                    name="unlink-outline"
                    size={20}
                    color={actionsDisabled ? "#CBD5E1" : "#D97706"}
                  />
                </Pressable>
              ) : null}
              {onDelete ? (
                <Pressable
                  onPress={() => {
                    if (!actionsDisabled) onDelete(child);
                  }}
                  disabled={actionsDisabled}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={t("admin.parentChildDeleteA11y", {
                    name: child.name,
                  })}
                  style={styles.actionBtn}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={actionsDisabled ? "#CBD5E1" : "#DC2626"}
                  />
                </Pressable>
              ) : null}
            </View>
          ) : null}
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
  rowWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0,
    backgroundColor: "#FFFFFF",
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
  colActions: {
    width: 108,
    textAlign: "center",
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
  actions: {
    width: 108,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 2,
    paddingRight: 8,
  },
  actionBtn: {
    padding: 6,
  },
  loader: { marginTop: 24 },
  empty: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 24,
  },
});
