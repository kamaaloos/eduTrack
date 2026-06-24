import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { UserData, UserRole } from "../../hooks/useAdminUsers";
import type { TeacherSubjectLink } from "../../hooks/useAdminRelations";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import { useAdminData } from "../../src/context/adminDataContext";
import {
  adminDirectoryCardStyle,
  adminDirectoryCardsWrapStyle,
  adminDirectoryTableHeadStyle,
  adminDirectoryTableRowStyle,
  adminModalAnimationType,
  adminModalBackdropStyle,
  adminModalCardStyle,
} from "../../src/constants/platformLayout";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import {
  confirmDestructiveAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";
import { getCallableErrorMessage } from "../../src/utils/callableErrorMessage";
import { UserAvatar } from "../common/UserAvatar";
import { parsePhotoURL } from "../../src/utils/userAvatar";
import { db } from "../../src/services/firebase";
import {
  formatTeacherClassAssigned,
  formatTeacherSubjects,
  type TeacherClassLink,
} from "../../src/utils/teacherDirectoryDisplay";
import { AuthFormField } from "../auth/AuthFormField";
import { TempPasswordShareModal } from "./TempPasswordShareModal";
import { DirectoryPagination } from "./DirectoryPagination";

type UserDirectoryListProps = {
  role: UserRole;
  title: string;
  subtitle: string;
  users: UserData[];
  focusUserId?: string;
  openPasswordOnFocus?: boolean;
};

type UserRowActionsProps = {
  item: UserData;
  compact?: boolean;
  onEdit: (user: UserData) => void;
  onPassword: (user: UserData) => void;
  onRemove: (user: UserData) => void;
};

function resolveClassDisplayName(
  classId: string | undefined,
  classNameById: Record<string, string>,
): string {
  if (!classId) return "—";
  return classNameById[classId] || classId;
}

function UserRowActions({
  item,
  compact = false,
  onEdit,
  onPassword,
  onRemove,
}: UserRowActionsProps) {
  const { t } = useTranslation();

  return (
    <View style={[styles.actions, compact && styles.actionsCompact]}>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => onEdit(item)}
        accessibilityLabel={t("common.edit")}
      >
        <Ionicons name="create-outline" size={18} color="#2563EB" />
        {!compact ? (
          <Text style={styles.actionEdit}>{t("common.edit")}</Text>
        ) : null}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => onPassword(item)}
        accessibilityLabel={t("admin.setPasswordAction")}
      >
        <Ionicons name="key-outline" size={18} color="#D97706" />
        {!compact ? (
          <Text style={styles.actionReset}>{t("admin.setPasswordAction")}</Text>
        ) : null}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => void onRemove(item)}
        accessibilityLabel={t("common.remove")}
      >
        <Ionicons name="trash-outline" size={18} color="#DC2626" />
        {!compact ? (
          <Text style={styles.actionRemove}>{t("common.remove")}</Text>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

function UserDirectoryCard({
  item,
  layout,
  showClassMeta,
  showTeacherMeta,
  classNameById,
  teacherMetaById,
  onEdit,
  onPassword,
  onRemove,
}: {
  item: UserData;
  layout: ReturnType<typeof usePlatformLayout>;
  showClassMeta: boolean;
  showTeacherMeta: boolean;
  classNameById: Record<string, string>;
  teacherMetaById: Record<string, { classes: string; subjects: string }>;
  onEdit: (user: UserData) => void;
  onPassword: (user: UserData) => void;
  onRemove: (user: UserData) => void;
}) {
  const { t } = useTranslation();
  const teacherMeta = teacherMetaById[item.id];

  return (
    <View style={adminDirectoryCardStyle(layout)}>
      <View style={styles.cardTop}>
        <UserAvatar
          name={item.name}
          email={item.email}
          photoURL={parsePhotoURL(item.photoURL)}
          size={44}
          textColor="#2563EB"
          backgroundColor="#EFF6FF"
        />
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
          {showClassMeta && item.classId ? (
            <Text style={styles.meta}>
              {t("common.class")}:{" "}
              {resolveClassDisplayName(item.classId, classNameById)}
            </Text>
          ) : null}
          {showTeacherMeta ? (
            <>
              <Text style={styles.meta} numberOfLines={2}>
                {t("admin.classAssignedColumn")}: {teacherMeta?.classes ?? "—"}
              </Text>
              <Text style={styles.meta} numberOfLines={2}>
                {t("common.subject")}: {teacherMeta?.subjects ?? "—"}
              </Text>
            </>
          ) : null}
        </View>
      </View>

      <UserRowActions
        item={item}
        onEdit={onEdit}
        onPassword={onPassword}
        onRemove={onRemove}
      />
    </View>
  );
}

export function UserDirectoryList({
  role,
  title,
  subtitle,
  users,
  focusUserId,
  openPasswordOnFocus = false,
}: UserDirectoryListProps) {
  const { t } = useTranslation();
  const layout = usePlatformLayout();
  const showTableLayout = layout.isDesktopWeb;
  const showClassColumn = role === "student";
  const showTeacherColumns = role === "teacher";
  const roleLabel = t(`common.${role}`);
  const {
    usersLoading,
    updateUser,
    setUserPassword,
    removeUser,
    classes,
    loadTeacherSubjectAssignments,
  } = useAdminData();
  const [search, setSearch] = useState("");
  const [teacherSubjectLinks, setTeacherSubjectLinks] = useState<
    TeacherSubjectLink[]
  >([]);
  const [teacherClassLinks, setTeacherClassLinks] = useState<TeacherClassLink[]>(
    [],
  );
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
  const handledFocusUserIdRef = useRef<string | null>(null);

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

  const pagination = usePaginatedList(filtered, showTableLayout ? 8 : 4, search);
  const classNameById = useMemo(
    () =>
      Object.fromEntries(
        classes.map((cls) => [cls.id, cls.name || cls.id]),
      ) as Record<string, string>,
    [classes],
  );

  const loadTeacherMeta = useCallback(async () => {
    if (role !== "teacher") return;

    try {
      const [subjectLinks, classSnap] = await Promise.all([
        loadTeacherSubjectAssignments(),
        getDocs(collection(db, "teacherClasses")),
      ]);

      setTeacherSubjectLinks(subjectLinks);
      setTeacherClassLinks(
        classSnap.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            teacherId: data.teacherId as string,
            classId: data.classId as string,
          };
        }),
      );
    } catch (err) {
      console.error("Load teacher directory assignments:", err);
    }
  }, [loadTeacherSubjectAssignments, role]);

  useFocusEffect(
    useCallback(() => {
      void loadTeacherMeta();
    }, [loadTeacherMeta]),
  );

  const teacherMetaById = useMemo(() => {
    if (!showTeacherColumns) {
      return {};
    }

    return Object.fromEntries(
      users.map((teacher) => [
        teacher.id,
        {
          classes: formatTeacherClassAssigned(
            teacher.id,
            teacherSubjectLinks,
            teacherClassLinks,
            classNameById,
          ),
          subjects: formatTeacherSubjects(teacher.id, teacherSubjectLinks),
        },
      ]),
    ) as Record<string, { classes: string; subjects: string }>;
  }, [
    classNameById,
    showTeacherColumns,
    teacherClassLinks,
    teacherSubjectLinks,
    users,
  ]);

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

  useEffect(() => {
    if (!focusUserId || usersLoading) return;
    if (handledFocusUserIdRef.current === focusUserId) return;

    const user = users.find((entry) => entry.id === focusUserId);
    if (!user) return;

    handledFocusUserIdRef.current = focusUserId;
    setSearch(user.email?.trim() || user.name?.trim() || "");

    if (openPasswordOnFocus) {
      openPasswordModal(user);
    }
  }, [focusUserId, openPasswordOnFocus, users, usersLoading]);

  useEffect(() => {
    if (!focusUserId) {
      handledFocusUserIdRef.current = null;
    }
  }, [focusUserId]);

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
        getCallableErrorMessage(err, t("admin.setPasswordFailed")),
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

  const renderCardList = () => (
    <View style={adminDirectoryCardsWrapStyle(layout)}>
      {pagination.pageItems.map((item) => (
        <UserDirectoryCard
          key={item.id}
          item={item}
          layout={layout}
          showClassMeta={showClassColumn}
          showTeacherMeta={showTeacherColumns}
          classNameById={classNameById}
          teacherMetaById={teacherMetaById}
          onEdit={openEdit}
          onPassword={openPasswordModal}
          onRemove={onRemove}
        />
      ))}
    </View>
  );

  const renderTableList = () => (
    <>
      <View style={adminDirectoryTableHeadStyle()}>
        <Text style={[styles.th, styles.colName]}>{t("admin.fullNameLabel")}</Text>
        <Text style={[styles.th, styles.colEmail]}>
          {t("admin.emailProfileLabel")}
        </Text>
        <Text style={[styles.th, styles.colPhone]}>{t("admin.phoneLabel")}</Text>
        {showClassColumn ? (
          <Text style={[styles.th, styles.colClass]}>{t("common.class")}</Text>
        ) : null}
        {showTeacherColumns ? (
          <>
            <Text style={[styles.th, styles.colTeacherClass]}>
              {t("admin.classAssignedColumn")}
            </Text>
            <Text style={[styles.th, styles.colTeacherSubject]}>
              {t("common.subject")}
            </Text>
          </>
        ) : null}
        <Text style={[styles.th, styles.colActions]}>
          {t("admin.directoryActionsColumn")}
        </Text>
      </View>

      {pagination.pageItems.map((item) => (
        <View key={item.id} style={adminDirectoryTableRowStyle()}>
          <View style={[styles.colName, styles.tableNameCell]}>
            <UserAvatar
              name={item.name}
              email={item.email}
              photoURL={parsePhotoURL(item.photoURL)}
              size={32}
              textColor="#2563EB"
              backgroundColor="#EFF6FF"
            />
            <Text style={styles.tableName} numberOfLines={1}>
              {item.name || t("common.unnamed")}
            </Text>
          </View>
          <Text style={[styles.tableCell, styles.colEmail]} numberOfLines={1}>
            {item.email || "—"}
          </Text>
          <Text style={[styles.tableCell, styles.colPhone]} numberOfLines={1}>
            {typeof item.phone === "string" && item.phone.trim()
              ? item.phone.trim()
              : "—"}
          </Text>
          {showClassColumn ? (
            <Text style={[styles.tableCell, styles.colClass]} numberOfLines={1}>
              {resolveClassDisplayName(item.classId, classNameById)}
            </Text>
          ) : null}
          {showTeacherColumns ? (
            <>
              <Text
                style={[styles.tableCell, styles.colTeacherClass]}
                numberOfLines={2}
              >
                {teacherMetaById[item.id]?.classes ?? "—"}
              </Text>
              <Text
                style={[styles.tableCell, styles.colTeacherSubject]}
                numberOfLines={2}
              >
                {teacherMetaById[item.id]?.subjects ?? "—"}
              </Text>
            </>
          ) : null}
          <View style={styles.colActions}>
            <UserRowActions
              item={item}
              compact
              onEdit={openEdit}
              onPassword={openPasswordModal}
              onRemove={onRemove}
            />
          </View>
        </View>
      ))}
    </>
  );

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

          {showTableLayout ? renderTableList() : renderCardList()}
        </>
      )}

      <Modal
        visible={editing != null}
        animationType={adminModalAnimationType(layout)}
        transparent
        onRequestClose={closeEdit}
      >
        <Pressable
          style={adminModalBackdropStyle(layout)}
          onPress={closeEdit}
        >
          <Pressable
            style={adminModalCardStyle(layout)}
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
        animationType={adminModalAnimationType(layout)}
        transparent
        onRequestClose={closePasswordModal}
      >
        <Pressable
          style={adminModalBackdropStyle(layout)}
          onPress={closePasswordModal}
        >
          <Pressable
            style={adminModalCardStyle(layout)}
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
    borderColor: INNER_CARD_BORDER_GREEN,
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
  cardTop: { flexDirection: "row", gap: 12, marginBottom: 12 },
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
  actionsCompact: {
    borderTopWidth: 0,
    paddingTop: 0,
    gap: 4,
    justifyContent: "flex-end",
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
  th: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  colName: { flex: 1.3, minWidth: 0 },
  colEmail: { flex: 1.4, minWidth: 0 },
  colPhone: { flex: 1, minWidth: 0 },
  colClass: { width: 88, minWidth: 0 },
  colTeacherClass: { flex: 1, minWidth: 0 },
  colTeacherSubject: { flex: 1, minWidth: 0 },
  colActions: { width: 132, alignItems: "flex-end" },
  tableNameCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tableName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    minWidth: 0,
  },
  tableCell: {
    fontSize: 13,
    color: "#64748B",
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
