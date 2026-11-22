import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAdminData } from "../../src/context/adminDataContext";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";
import type { ParentChild } from "../../src/services/parentChildren";
import { getLinkedParentIdForStudent } from "../../src/services/parentStudentLinks";
import {
  confirmAction,
  confirmDestructiveAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";
import { PasswordInput } from "../PasswordInput";
import { SchoolThemeButton } from "../common/SchoolThemeButton";
import { AdminParentChildrenList } from "./AdminParentChildrenList";
import { Selector } from "./Selector";

type AdminParentChildrenPanelProps = {
  parentId: string;
  parentName: string;
  linkedChildren: ParentChild[];
  loading?: boolean;
  onChanged?: () => void | Promise<void>;
};

type PanelMode = "list" | "linkExisting" | "createNew" | "edit";

export function AdminParentChildrenPanel({
  parentId,
  parentName,
  linkedChildren,
  loading = false,
  onChanged,
}: AdminParentChildrenPanelProps) {
  const { t } = useTranslation();
  const { theme } = useSchoolTheme();
  const primary = theme.primaryColor;
  const {
    students,
    parents,
    classes,
    createUser,
    updateUser,
    removeUser,
    assignStudentToClass,
    linkParentToStudent,
    unlinkParentFromStudent,
    relationsLoading,
    usersLoading,
  } = useAdminData();

  const [mode, setMode] = useState<PanelMode>("list");
  const [busy, setBusy] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(() => t("admin.defaultPassword"));
  const [classId, setClassId] = useState("");

  const linkedIds = useMemo(
    () => new Set(linkedChildren.map((c) => c.id)),
    [linkedChildren],
  );

  const availableStudents = useMemo(
    () =>
      students
        .filter((s) => !linkedIds.has(s.id))
        .map((s) => {
          const classLabel =
            s.classId &&
            classes.find((c) => c.id === s.classId)?.name;
          const base = s.name || s.email || s.id;
          return {
            id: s.id,
            name: classLabel
              ? t("admin.parentChildStudentWithClass", {
                  name: base,
                  className: classLabel,
                })
              : base,
          };
        })
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        ),
    [students, linkedIds, classes, t],
  );

  const classItems = useMemo(
    () =>
      classes
        .map((c) => ({ id: c.id, name: c.name || c.id }))
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        ),
    [classes],
  );

  const working = busy || relationsLoading || usersLoading;

  const resetCreateForm = () => {
    setName("");
    setEmail("");
    setPassword(t("admin.defaultPassword"));
    setClassId("");
    setEditingChildId(null);
  };

  const toggleMode = (next: PanelMode) => {
    setMode((m) => {
      if (m === next) {
        resetCreateForm();
        return "list";
      }
      if (next !== "edit") {
        setEditingChildId(null);
      }
      return next;
    });
  };

  const openEdit = (child: ParentChild) => {
    setEditingChildId(child.id);
    setName(child.name || "");
    setEmail(child.email || "");
    setClassId(child.classId || "");
    setMode("edit");
  };

  const resolveName = (id: string) =>
    students.find((s) => s.id === id)?.name ||
    students.find((s) => s.id === id)?.email ||
    id;

  const handleLinkExisting = async () => {
    if (!selectedStudentId) {
      showErrorAlert(t("common.error"), t("admin.parentChildSelectStudent"));
      return;
    }

    const studentName = resolveName(selectedStudentId);
    const existingParentId =
      await getLinkedParentIdForStudent(selectedStudentId);
    if (existingParentId && existingParentId !== parentId) {
      const currentParent =
        parents.find((p) => p.id === existingParentId)?.name ||
        parents.find((p) => p.id === existingParentId)?.email ||
        existingParentId;
      const confirmed = await confirmAction(
        t("admin.replaceParentTitle"),
        t("admin.replaceParentMessage", {
          student: studentName,
          currentParent,
          newParent: parentName,
        }),
        t("admin.replaceParentConfirm"),
        t("common.cancel"),
      );
      if (!confirmed) return;
    }

    setBusy(true);
    try {
      await linkParentToStudent(parentId, selectedStudentId);
      showSuccessAlert(
        t("common.success"),
        t("admin.parentChildLinked", { name: studentName }),
      );
      setSelectedStudentId("");
      setMode("list");
      await onChanged?.();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.operationFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCreateAndLink = async () => {
    if (!name.trim() || !email.trim()) {
      showErrorAlert(
        t("common.error"),
        t("admin.parentChildCreateRequired"),
      );
      return;
    }
    if (!classId) {
      showErrorAlert(t("common.error"), t("admin.parentChildSelectClass"));
      return;
    }

    setBusy(true);
    try {
      const studentId = await createUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role: "student",
      });
      await assignStudentToClass(studentId, classId);
      await linkParentToStudent(parentId, studentId);
      showSuccessAlert(
        t("common.success"),
        t("admin.parentChildCreated", { name: name.trim() }),
      );
      resetCreateForm();
      setMode("list");
      await onChanged?.();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.createUserFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingChildId) return;
    if (!name.trim() || !email.trim()) {
      showErrorAlert(
        t("common.error"),
        t("admin.parentChildCreateRequired"),
      );
      return;
    }

    const child = linkedChildren.find((c) => c.id === editingChildId);
    setBusy(true);
    try {
      await updateUser(editingChildId, {
        name: name.trim(),
        email: email.trim(),
      });
      if (classId && classId !== child?.classId) {
        await assignStudentToClass(editingChildId, classId);
      }
      showSuccessAlert(
        t("common.success"),
        t("admin.parentChildUpdated", { name: name.trim() }),
      );
      resetCreateForm();
      setMode("list");
      await onChanged?.();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.couldNotSave"),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleUnlink = async (child: ParentChild) => {
    const confirmed = await confirmDestructiveAction(
      t("admin.parentChildUnlinkTitle"),
      t("admin.parentChildUnlinkMessage", {
        name: child.name,
        parent: parentName,
      }),
      t("admin.parentChildUnlinkConfirm"),
      t("common.cancel"),
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      await unlinkParentFromStudent(parentId, child.id);
      showSuccessAlert(
        t("common.success"),
        t("admin.parentChildUnlinked", { name: child.name }),
      );
      if (editingChildId === child.id) {
        resetCreateForm();
        setMode("list");
      }
      await onChanged?.();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.operationFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (child: ParentChild) => {
    const confirmed = await confirmDestructiveAction(
      t("admin.parentChildDeleteTitle"),
      t("admin.parentChildDeleteMessage", { name: child.name }),
      t("common.remove"),
      t("common.cancel"),
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const result = await removeUser(child.id, "student");
      if (result.authDeleted === false) {
        showErrorAlert(
          t("admin.userRemovedPartialTitle"),
          t("admin.userRemovedPartialMessage", {
            role: t("common.student"),
          }),
        );
      } else {
        showSuccessAlert(
          t("common.success"),
          t("admin.parentChildDeleted", { name: child.name }),
        );
      }
      if (editingChildId === child.id) {
        resetCreateForm();
        setMode("list");
      }
      await onChanged?.();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.couldNotRemove"),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.sectionTitle}>
        {t("admin.parentDetailChildrenTitle")}
      </Text>
      <Text style={styles.sectionHint}>
        {t("admin.parentDetailChildrenManageHint")}
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() => toggleMode("linkExisting")}
          disabled={working}
          style={[
            styles.actionChip,
            mode === "linkExisting"
              ? { backgroundColor: primary, borderColor: primary }
              : null,
          ]}
        >
          <Text
            style={[
              styles.actionChipText,
              mode === "linkExisting" ? styles.actionChipTextActive : null,
            ]}
          >
            {t("admin.parentChildLinkExisting")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => toggleMode("createNew")}
          disabled={working}
          style={[
            styles.actionChip,
            mode === "createNew"
              ? { backgroundColor: primary, borderColor: primary }
              : null,
          ]}
        >
          <Text
            style={[
              styles.actionChipText,
              mode === "createNew" ? styles.actionChipTextActive : null,
            ]}
          >
            {t("admin.parentChildCreateNew")}
          </Text>
        </Pressable>
      </View>

      {mode === "linkExisting" ? (
        <View style={styles.formBlock}>
          <Text style={styles.formTitle}>
            {t("admin.parentChildLinkExistingTitle")}
          </Text>
          <Text style={styles.formHint}>
            {t("admin.parentChildLinkExistingHint")}
          </Text>
          <Selector
            title={t("admin.parentChildSelectStudent")}
            items={availableStudents}
            selectedId={selectedStudentId}
            onSelect={setSelectedStudentId}
            disabled={working}
            searchable
            searchPlaceholder={t("admin.selectorSearch")}
            visibleLimit={6}
            maxListHeight={280}
          />
          <SchoolThemeButton
            label={t("admin.parentChildLinkConfirm")}
            onPress={handleLinkExisting}
            loading={working}
            disabled={working || !selectedStudentId}
          />
        </View>
      ) : null}

      {mode === "createNew" ? (
        <View style={styles.formBlock}>
          <Text style={styles.formTitle}>
            {t("admin.parentChildCreateNewTitle")}
          </Text>
          <Text style={styles.formHint}>
            {t("admin.parentChildCreateNewHint")}
          </Text>
          <TextInput
            placeholder={t("admin.fullNamePlaceholder")}
            value={name}
            onChangeText={setName}
            style={styles.input}
            editable={!working}
          />
          <TextInput
            placeholder={t("common.email")}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!working}
          />
          <PasswordInput
            placeholder={t("admin.passwordMinPlaceholder")}
            value={password}
            onChangeText={setPassword}
            inputStyle={styles.input}
            editable={!working}
          />
          <Text style={styles.tempHint}>{t("admin.tempPasswordHint")}</Text>
          <Selector
            title={t("admin.parentChildSelectClass")}
            items={classItems}
            selectedId={classId}
            onSelect={setClassId}
            disabled={working}
            searchable
            searchPlaceholder={t("admin.selectorSearch")}
            visibleLimit={6}
            maxListHeight={280}
          />
          <SchoolThemeButton
            label={t("admin.parentChildCreateAndLink")}
            onPress={handleCreateAndLink}
            loading={working}
            disabled={working}
          />
        </View>
      ) : null}

      {mode === "edit" ? (
        <View style={styles.formBlock}>
          <Text style={styles.formTitle}>
            {t("admin.parentChildEditTitle")}
          </Text>
          <Text style={styles.formHint}>
            {t("admin.parentChildEditHint")}
          </Text>
          <TextInput
            placeholder={t("admin.fullNamePlaceholder")}
            value={name}
            onChangeText={setName}
            style={styles.input}
            editable={!working}
          />
          <TextInput
            placeholder={t("common.email")}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!working}
          />
          <Selector
            title={t("admin.parentChildSelectClass")}
            items={classItems}
            selectedId={classId}
            onSelect={setClassId}
            disabled={working}
            searchable
            searchPlaceholder={t("admin.selectorSearch")}
            visibleLimit={6}
            maxListHeight={280}
          />
          <SchoolThemeButton
            label={t("common.save")}
            onPress={handleSaveEdit}
            loading={working}
            disabled={working}
          />
        </View>
      ) : null}

      <AdminParentChildrenList
        linkedChildren={linkedChildren}
        loading={loading}
        actionsDisabled={working}
        onEdit={openEdit}
        onUnlink={handleUnlink}
        onDelete={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E3A8A",
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
    marginTop: -4,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionChip: {
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
  input: {
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "white",
    ...(Platform.OS === "web"
      ? ({ boxSizing: "border-box" } as object)
      : null),
  },
  tempHint: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginTop: -4,
  },
});
