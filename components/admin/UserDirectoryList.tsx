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
import type { UserData, UserRole } from "../../hooks/useAdminUsers";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { useAdminData } from "../../src/context/adminDataContext";
import {
  confirmDestructiveAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";
import { AuthFormField } from "../auth/AuthFormField";
import { TempPasswordShareModal } from "./TempPasswordShareModal";
import { DirectoryPagination } from "./DirectoryPagination";

const isWeb = Platform.OS === "web";

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
  const { usersLoading, updateUser, setUserPassword, removeUser } =
    useAdminData();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<UserData | null>(null);
  const [passwordUser, setPasswordUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [settingPassword, setSettingPassword] = useState(false);
  const [shareCard, setShareCard] = useState<{
    user: UserData;
    password: string;
  } | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        (typeof u.phone === "string" && u.phone.toLowerCase().includes(q)),
    );
  }, [users, search]);

  const pagination = usePaginatedList(filtered, 4, search);

  const openEdit = (user: UserData) => {
    setEditing(user);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditPhone(typeof user.phone === "string" ? user.phone : "");
  };

  const closeEdit = () => {
    setEditing(null);
    setEditName("");
    setEditEmail("");
    setEditPhone("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateUser(editing.id, {
        name: editName,
        email: editEmail,
        phone: editPhone,
      });
      showSuccessAlert(t("common.saved"), t("admin.profileUpdated"));
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

  const closePasswordModal = () => {
    setPasswordUser(null);
    setNewPassword("");
    setConfirmPassword("");
  };

  const openPasswordModal = (user: UserData) => {
    setPasswordUser(user);
    setNewPassword("");
    setConfirmPassword("");
  };

  const savePassword = async () => {
    if (!passwordUser) return;
    if (newPassword.length < 6) {
      showErrorAlert(t("common.error"), t("admin.setPasswordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorAlert(t("common.error"), t("admin.setPasswordMismatch"));
      return;
    }

    setSettingPassword(true);
    try {
      await setUserPassword(passwordUser.id, newPassword);
      setShareCard({ user: passwordUser, password: newPassword });
      closePasswordModal();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("common.connectionError"),
      );
    } finally {
      setSettingPassword(false);
    }
  };

  const onRemove = async (user: UserData) => {
    const confirmed = await confirmDestructiveAction(
      t("admin.removeUserTitle", { role: roleLabel }),
      t("admin.removeUserMessage", {
        name: user.name || user.email || t("common.unnamed"),
      }),
      t("common.remove"),
      t("common.cancel"),
    );
    if (!confirmed) return;

    try {
      await removeUser(user.id, role);
      showSuccessAlert(
        t("common.success"),
        t("admin.userRemoved", { role: roleLabel }),
      );
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.couldNotRemove"),
      );
    }
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
                  {typeof item.phone === "string" && item.phone.trim() ? (
                    <Text style={styles.meta} numberOfLines={1}>
                      {item.phone.trim()}
                    </Text>
                  ) : null}
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
                  onPress={() => openPasswordModal(item)}
                >
                  <Ionicons name="key-outline" size={18} color="#D97706" />
                  <Text style={styles.actionReset}>
                    {t("admin.setPasswordAction")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => void onRemove(item)}
                >
                  <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  <Text style={styles.actionRemove}>{t("common.remove")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}

      <Modal
        visible={editing != null}
        animationType={Platform.OS === "web" ? "fade" : "slide"}
        transparent
        onRequestClose={closeEdit}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeEdit}>
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>{t("admin.editUser")}</Text>
                <Text style={styles.modalHint}>{subtitle}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={closeEdit}
                disabled={saving}
                accessibilityLabel={t("common.close")}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

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

            <Text style={styles.label}>{t("admin.phoneLabel")}</Text>
            <TextInput
              style={styles.input}
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
              editable={!saving}
              placeholder={t("admin.phonePlaceholder")}
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

      <Modal
        visible={passwordUser != null}
        animationType={Platform.OS === "web" ? "fade" : "slide"}
        transparent
        onRequestClose={closePasswordModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={closePasswordModal}>
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>
                  {t("admin.setPasswordTitle")}
                </Text>
                <Text style={styles.modalHint}>
                  {t("admin.setPasswordMessage", {
                    name:
                      passwordUser?.name ||
                      passwordUser?.email ||
                      t("common.unnamed"),
                  })}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={closePasswordModal}
                disabled={settingPassword}
                accessibilityLabel={t("common.close")}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <AuthFormField
              label={t("admin.setPasswordNew")}
              icon="key-outline"
              isPassword
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!settingPassword}
              containerStyle={styles.passwordField}
            />

            <AuthFormField
              label={t("admin.setPasswordConfirm")}
              icon="lock-closed-outline"
              isPassword
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!settingPassword}
              containerStyle={styles.passwordField}
            />

            <Text style={styles.note}>{t("admin.setPasswordHint")}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={closePasswordModal}
                disabled={settingPassword}
              >
                <Text style={styles.cancelBtnText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, settingPassword && styles.btnDisabled]}
                onPress={() => void savePassword()}
                disabled={settingPassword}
              >
                {settingPassword ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {t("admin.setPasswordAction")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <TempPasswordShareModal
        visible={shareCard != null}
        user={shareCard?.user ?? null}
        role={role}
        tempPassword={shareCard?.password ?? ""}
        onClose={() => setShareCard(null)}
      />
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  modalHeaderText: { flex: 1, minWidth: 0 },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  modalHint: { fontSize: 13, color: "#64748B", marginTop: 4 },
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
  passwordField: { marginBottom: 12 },
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
