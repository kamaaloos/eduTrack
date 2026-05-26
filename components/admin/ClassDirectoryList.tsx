import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { ClassData } from "../../hooks/useAdminClasses";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { useAdminData } from "../../src/context/adminDataContext";
import { DirectoryPagination } from "./DirectoryPagination";

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
      Alert.alert(t("common.saved"), t("admin.classUpdated"));
      closeEdit();
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.couldNotSave"),
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (cls: ClassData) => {
    Alert.alert(
      t("admin.deleteClassTitle"),
      t("admin.deleteClassMessage", { name: cls.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteClass(cls.id);
              Alert.alert(t("common.success"), t("admin.classRemoved"));
            } catch (err) {
              Alert.alert(
                t("common.error"),
                err instanceof Error ? err.message : t("admin.couldNotDelete"),
              );
            }
          },
        },
      ],
    );
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

      <Modal visible={editing != null} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t("admin.renameClass")}</Text>
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
                onPress={saveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>{t("common.save")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
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
