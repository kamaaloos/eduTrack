import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import { useAdminData } from "../../src/context/adminDataContext";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";
import {
  confirmAction,
  confirmDestructiveAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";
import { SchoolThemeButton } from "../common/SchoolThemeButton";
import { AdminDirectoryTableRow } from "./AdminDirectoryTableRow";
import { Selector } from "./Selector";

type AdminTeacherClassesPanelProps = {
  teacherId: string;
  teacherName: string;
};

export function AdminTeacherClassesPanel({
  teacherId,
  teacherName,
}: AdminTeacherClassesPanelProps) {
  const { t } = useTranslation();
  const { theme } = useSchoolTheme();
  const primary = theme.primaryColor;
  const {
    classes,
    assignTeacherToClass,
    removeTeacherFromClass,
    loadTeacherClassAssignments,
    relationsLoading,
  } = useAdminData();

  const [linkedClassIds, setLinkedClassIds] = useState<string[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const classNameById = useMemo(() => {
    const map = new Map<string, string>();
    classes.forEach((c) => map.set(c.id, c.name || c.id));
    return map;
  }, [classes]);

  const linkedClasses = useMemo(
    () =>
      linkedClassIds
        .map((id) => ({
          id,
          name: classNameById.get(id) || id,
        }))
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        ),
    [linkedClassIds, classNameById],
  );

  const availableClasses = useMemo(
    () =>
      classes
        .filter((c) => !linkedClassIds.includes(c.id))
        .map((c) => ({ id: c.id, name: c.name || c.id }))
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        ),
    [classes, linkedClassIds],
  );

  const refreshLinks = useCallback(async () => {
    if (!teacherId) return;
    setLoadingLinks(true);
    try {
      const links = await loadTeacherClassAssignments(teacherId);
      setLinkedClassIds(links.map((l) => l.classId));
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.operationFailed"),
      );
    } finally {
      setLoadingLinks(false);
    }
  }, [loadTeacherClassAssignments, t, teacherId]);

  useFocusEffect(
    useCallback(() => {
      void refreshLinks();
    }, [refreshLinks]),
  );

  useEffect(() => {
    setSelectedClassIds([]);
    setAdding(false);
  }, [teacherId]);

  const working = busy || relationsLoading || loadingLinks;

  const handleUnlink = async (classId: string, className: string) => {
    const confirmed = await confirmDestructiveAction(
      t("admin.teacherUnlinkTitle"),
      t("admin.teacherUnlinkMessage", {
        teacher: teacherName,
        className,
      }),
      t("admin.teacherUnlinkConfirm"),
      t("common.cancel"),
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      await removeTeacherFromClass(teacherId, classId);
      showSuccessAlert(
        t("common.success"),
        t("admin.teacherUnlinked", { className }),
      );
      await refreshLinks();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.operationFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleLink = async () => {
    if (selectedClassIds.length === 0) {
      showErrorAlert(t("common.error"), t("admin.teacherLinkSelectClasses"));
      return;
    }

    const names = selectedClassIds
      .map((id) => classNameById.get(id) || id)
      .join(", ");
    const confirmed = await confirmAction(
      t("admin.teacherLinkTitle"),
      t("admin.teacherLinkMessage", {
        teacher: teacherName,
        classes: names,
        count: selectedClassIds.length,
      }),
      t("admin.teacherLinkConfirm"),
      t("common.cancel"),
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      for (const classId of selectedClassIds) {
        await assignTeacherToClass(teacherId, classId);
      }
      showSuccessAlert(
        t("common.success"),
        t("admin.teacherLinked", { count: selectedClassIds.length }),
      );
      setSelectedClassIds([]);
      setAdding(false);
      await refreshLinks();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.operationFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.hint}>{t("admin.teacherClassesHint")}</Text>

      <Pressable
        onPress={() => setAdding((v) => !v)}
        disabled={working}
        style={[
          styles.actionChip,
          adding ? { backgroundColor: primary, borderColor: primary } : null,
        ]}
      >
        <Text
          style={[
            styles.actionChipText,
            adding ? styles.actionChipTextActive : null,
          ]}
        >
          {t("admin.teacherLinkClasses")}
        </Text>
      </Pressable>

      {adding ? (
        <View style={styles.formBlock}>
          <Text style={styles.formTitle}>{t("admin.teacherLinkTitle")}</Text>
          <Text style={styles.formHint}>{t("admin.teacherLinkHint")}</Text>
          {availableClasses.length === 0 ? (
            <Text style={styles.emptyInline}>
              {t("admin.teacherNoClassesToLink")}
            </Text>
          ) : (
            <Selector
              title={t("admin.teacherSelectClasses")}
              items={availableClasses}
              multiSelect
              selectedIds={selectedClassIds}
              onChangeSelectedIds={setSelectedClassIds}
              disabled={working}
              searchable
              searchPlaceholder={t("admin.selectorSearch")}
              visibleLimit={6}
              maxListHeight={280}
            />
          )}
          <SchoolThemeButton
            label={t("admin.teacherLinkConfirm")}
            onPress={handleLink}
            loading={working}
            disabled={working || selectedClassIds.length === 0}
          />
        </View>
      ) : null}

      {loadingLinks ? (
        <ActivityIndicator color={primary} style={styles.loader} />
      ) : linkedClasses.length === 0 ? (
        <Text style={styles.empty}>{t("admin.teacherNoLinkedClasses")}</Text>
      ) : (
        <View style={styles.list}>
          {linkedClasses.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.rowWrap,
                index === linkedClasses.length - 1 && styles.rowLast,
              ]}
            >
              <AdminDirectoryTableRow style={styles.rowMain}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
              </AdminDirectoryTableRow>
              <Pressable
                onPress={() => {
                  if (!working) void handleUnlink(item.id, item.name);
                }}
                disabled={working}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t("admin.teacherUnlinkA11y", {
                  className: item.name,
                })}
                style={styles.removeBtn}
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={22}
                  color={working ? "#CBD5E1" : "#DC2626"}
                />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },
  actionChip: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  actionChipTextActive: {
    color: "#FFFFFF",
  },
  formBlock: {
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  formHint: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },
  emptyInline: {
    fontSize: 13,
    color: "#64748B",
    paddingVertical: 8,
  },
  loader: { marginTop: 16 },
  empty: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 24,
  },
  list: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    backgroundColor: "#F8FAFC",
    overflow: "hidden",
  },
  rowWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  rowMain: {
    flex: 1,
    borderBottomWidth: 0,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  removeBtn: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
});
