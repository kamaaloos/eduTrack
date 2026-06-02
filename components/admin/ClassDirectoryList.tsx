import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { ClassData } from "../../hooks/useAdminClasses";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { useAdminData } from "../../src/context/adminDataContext";
import {
  confirmAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";
import { DirectoryPagination } from "./DirectoryPagination";

const isWeb = Platform.OS === "web";

export function ClassDirectoryList() {
  const { t } = useTranslation();
  const { classes, classesLoading, updateClass, deleteClass } = useAdminData();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ClassData | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) => c.name?.toLowerCase().includes(q));
  }, [classes, search]);

  const pagination = usePaginatedList(filtered, 4, search);

  const openEdit = (cls: ClassData) => {
    setEditing(cls);
    setEditName(cls.name || "");
  };

  const closeEdit = () => {
    setEditing(null);
    setEditName("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateClass(editing.id, editName);
      showSuccessAlert(t("common.saved"), t("admin.classUpdated"));
      closeEdit();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.couldNotSave"),
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (cls: ClassData) => {
    void (async () => {
      const confirmed = await confirmAction(
        t("admin.deleteClassTitle"),
        t("admin.deleteClassMessage", { name: cls.name }),
        t("common.delete"),
        t("common.cancel"),
      );
      if (!confirmed) return;

      try {
        await deleteClass(cls.id);
        showSuccessAlert(t("common.success"), t("admin.classRemoved"));
      } catch (err) {
        showErrorAlert(
          t("common.error"),
          err instanceof Error ? err.message : t("admin.couldNotDelete"),
        );
      }
    })();
  };

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.search}
        placeholder={t("admin.searchClasses")}
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />

      {classesLoading && classes.length === 0 ? (
        <ActivityIndicator style={styles.loader} color="#2563EB" />
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>{t("admin.noClassesFound")}</Text>
      ) : (
        <>
          <DirectoryPagination
            rangeStart={pagination.rangeStart}
            rangeEnd={pagination.rangeEnd}
            totalCount={pagination.totalCount}
            page={pagination.page}
            totalPages={pagination.totalPages}
            canPrev={pagination.canPrev}
            canNext={pagination.canNext}
            onPrev={pagination.prevPage}
            onNext={pagination.nextPage}
          />

          {pagination.pageItems.map((item) => {
            const subjects = Array.isArray(item.subjects) ? item.subjects : [];
            const subjectCountLabel =
              subjects.length === 1
                ? t("admin.subjectsCount", { count: subjects.length })
                : t("admin.subjectsCount_plural", { count: subjects.length });

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.iconWrap}>
                    <Ionicons name="school" size={22} color="#D97706" />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.name}>
                      {item.name || t("common.classFallback")}
                    </Text>
                    <Text style={styles.meta}>
                      {subjectCountLabel}
                      {subjects.length > 0
                        ? `: ${subjects.slice(0, 4).join(", ")}${subjects.length > 4 ? "…" : ""}`
                        : ""}
                    </Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openEdit(item)}
                  >
                    <Ionicons name="create-outline" size={18} color="#2563EB" />
                    <Text style={styles.actionEdit}>{t("common.rename")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onDelete(item)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    <Text style={styles.actionRemove}>{t("common.delete")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </>
      )}

      <Modal
        visible={editing != null}
        animationType={isWeb ? "fade" : "slide"}
        transparent
        onRequestClose={closeEdit}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeEdit}>
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("admin.renameClass")}</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={closeEdit}
                disabled={saving}
                accessibilityLabel={t("common.close")}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              editable={!saving}
              placeholder={t("admin.classNameField")}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={closeEdit}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.btnDisabled]}
                onPress={() => void saveEdit()}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>{t("common.save")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  search: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  loader: { marginTop: 40 },
  empty: { textAlign: "center", color: "#64748B", marginTop: 32 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTop: { flexDirection: "row", gap: 12, marginBottom: 12 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1 },
  name: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  meta: { fontSize: 12, color: "#64748B", marginTop: 4, lineHeight: 17 },
  actions: {
    flexDirection: "row",
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionEdit: { color: "#2563EB", fontWeight: "600", fontSize: 13 },
  actionRemove: { color: "#DC2626", fontWeight: "600", fontSize: 13 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: isWeb ? "center" : "flex-end",
    alignItems: isWeb ? "center" : "stretch",
    padding: isWeb ? 24 : 0,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: isWeb ? 16 : undefined,
    borderTopLeftRadius: isWeb ? 16 : 20,
    borderTopRightRadius: isWeb ? 16 : 20,
    width: isWeb ? ("100%" as const) : undefined,
    maxWidth: isWeb ? 480 : undefined,
    padding: 20,
    paddingBottom: isWeb ? 20 : 32,
    ...(isWeb
      ? ({
          boxShadow: "0 12px 40px rgba(15, 23, 42, 0.2)",
        } as object)
      : null),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A", flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  modalActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  cancelBtnText: { fontWeight: "700", color: "#475569" },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  saveBtnText: { fontWeight: "700", color: "#FFFFFF" },
  btnDisabled: { opacity: 0.6 },
});
