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
import type { UserData, UserRole } from "../../hooks/useAdminUsers";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { useAdminData } from "../../src/context/adminDataContext";
import { DirectoryPagination } from "./DirectoryPagination";

type UserDirectoryListProps = {
  role: UserRole;
  title: string;
  subtitle: string;
  users: UserData[];
};

export function UserDirectoryList({
  role,
  title,
  subtitle,
  users,
}: UserDirectoryListProps) {
  const { t } = useTranslation();
  const roleLabel = t(`common.${role}`);
  const { usersLoading, updateUser, resetUserPassword, removeUser } =
    useAdminData();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<UserData | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
    );
  }, [users, search]);

  const pagination = usePaginatedList(filtered, 4, search);

  const openEdit = (user: UserData) => {
    setEditing(user);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
  };

  const closeEdit = () => {
    setEditing(null);
    setEditName("");
    setEditEmail("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateUser(editing.id, { name: editName, email: editEmail });
      Alert.alert(t("common.saved"), t("admin.profileUpdated"));
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

  const onResetPassword = (user: UserData) => {
    if (!user.email) {
      Alert.alert(t("admin.noEmail"), t("admin.noEmailOnFile"));
      return;
    }
    Alert.alert(
      t("admin.resetPasswordTitle"),
      t("admin.resetPasswordMessage", { email: user.email }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("admin.sendEmail"),
          onPress: async () => {
            try {
              await resetUserPassword(user.email);
              Alert.alert(t("admin.emailSent"), t("admin.resetPasswordHint"));
            } catch (err) {
              Alert.alert(
                t("common.error"),
                err instanceof Error ? err.message : t("common.connectionError"),
              );
            }
          },
        },
      ],
    );
  };

  const onRemove = (user: UserData) => {
    Alert.alert(
      t("admin.removeUserTitle", { role: roleLabel }),
      t("admin.removeUserMessage", {
        name: user.name || user.email || t("common.unnamed"),
      }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.remove"),
          style: "destructive",
          onPress: async () => {
            try {
              await removeUser(user.id, role);
              Alert.alert(
                t("common.success"),
                t("admin.userRemoved", { role: roleLabel }),
              );
            } catch (err) {
              Alert.alert(
                t("common.error"),
                err instanceof Error ? err.message : t("admin.couldNotRemove"),
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
        placeholder={t("admin.searchUsers")}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />

      {usersLoading && users.length === 0 ? (
        <ActivityIndicator style={styles.loader} color="#2563EB" />
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>
          {search
            ? t("admin.noUsersForSearch", { role: roleLabel })
            : t("admin.noUsersFound", { role: roleLabel })}
        </Text>
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

          {pagination.pageItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(item.name || item.email || "?").charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name || t("common.unnamed")}
                  </Text>
                  <Text style={styles.email} numberOfLines={1}>
                    {item.email || "—"}
                  </Text>
                  {item.classId ? (
                    <Text style={styles.meta}>
                      {t("admin.classIdLabel", { id: item.classId })}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => openEdit(item)}
                >
                  <Ionicons name="create-outline" size={18} color="#2563EB" />
                  <Text style={styles.actionEdit}>{t("common.edit")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => onResetPassword(item)}
                >
                  <Ionicons name="key-outline" size={18} color="#D97706" />
                  <Text style={styles.actionReset}>
                    {t("admin.resetPasswordAction")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => onRemove(item)}
                >
                  <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  <Text style={styles.actionRemove}>{t("common.remove")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}

      <Modal visible={editing != null} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t("admin.editUser")}</Text>
            <Text style={styles.modalHint}>{subtitle}</Text>

            <Text style={styles.label}>{t("admin.fullNameLabel")}</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              editable={!saving}
            />

            <Text style={styles.label}>{t("admin.emailProfileLabel")}</Text>
            <TextInput
              style={styles.input}
              value={editEmail}
              onChangeText={setEditEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!saving}
            />

            <Text style={styles.note}>{t("admin.passwordResetNote")}</Text>

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
  empty: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 32,
    fontSize: 15,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTop: { flexDirection: "row", gap: 12, marginBottom: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "800", color: "#2563EB" },
  cardBody: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  email: { fontSize: 13, color: "#64748B", marginTop: 2 },
  meta: { fontSize: 12, color: "#94A3B8", marginTop: 4 },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  actionEdit: { color: "#2563EB", fontWeight: "600", fontSize: 13 },
  actionReset: { color: "#D97706", fontWeight: "600", fontSize: 13 },
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
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  modalHint: { fontSize: 13, color: "#64748B", marginTop: 4, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 14,
    backgroundColor: "#F9FAFB",
  },
  note: { fontSize: 12, color: "#64748B", lineHeight: 17, marginBottom: 16 },
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
