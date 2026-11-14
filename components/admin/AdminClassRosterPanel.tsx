import * as DocumentPicker from "expo-document-picker";
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
import type { UserData } from "../../hooks/useAdminUsers";
import { useAdminData } from "../../src/context/adminDataContext";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";
import {
  importStudentsIntoClass,
  parseClassStudentsWorkbook,
  type ImportSummary,
} from "../../src/services/adminExcelImport";
import { shareClassStudentsImportTemplate } from "../../src/services/adminExcelImportTemplate";
import {
  confirmAction,
  confirmDestructiveAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";
import {
  EXCEL_DOCUMENT_PICKER_TYPES,
  isLikelyExcelFilename,
  readExcelArrayBuffer,
} from "../../src/utils/readExcelFile";
import { PasswordInput } from "../PasswordInput";
import { SchoolThemeButton } from "../common/SchoolThemeButton";
import { AdminClassStudentNamesList } from "./AdminClassStudentNamesList";
import { Selector } from "./Selector";

type AdminClassRosterPanelProps = {
  classId: string;
  className: string;
  classStudents: UserData[];
  allStudents: UserData[];
  classes: { id: string; name: string }[];
  loading?: boolean;
  onSelectStudent?: (student: UserData) => void;
  onChanged?: () => void | Promise<void>;
};

type RosterMode = "list" | "addExisting" | "createNew" | "importExcel";

export function AdminClassRosterPanel({
  classId,
  className,
  classStudents,
  allStudents,
  classes,
  loading = false,
  onSelectStudent,
  onChanged,
}: AdminClassRosterPanelProps) {
  const { t } = useTranslation();
  const { theme } = useSchoolTheme();
  const primary = theme.primaryColor;
  const {
    assignStudentToClass,
    removeStudentFromClass,
    createUser,
    relationsLoading,
    usersLoading,
  } = useAdminData();

  const [mode, setMode] = useState<RosterMode>("list");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(() => t("admin.defaultPassword"));
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importRowCount, setImportRowCount] = useState(0);
  const [importRows, setImportRows] = useState<Record<string, unknown>[] | null>(
    null,
  );

  const classNameById = useMemo(() => {
    const map = new Map<string, string>();
    classes.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [classes]);

  const availableStudents = useMemo(
    () =>
      allStudents
        .filter((s) => s.classId !== classId)
        .map((s) => {
          const otherClass =
            s.classId && classNameById.get(s.classId)
              ? classNameById.get(s.classId)
              : null;
          const base = s.name || s.email || s.id;
          return {
            id: s.id,
            name: otherClass
              ? t("admin.classRosterStudentWithClass", {
                  name: base,
                  className: otherClass,
                })
              : base,
          };
        })
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        ),
    [allStudents, classId, classNameById, t],
  );

  const working = busy || relationsLoading || usersLoading;

  const resetCreateForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword(t("admin.defaultPassword"));
  };

  const handleRemove = async (student: UserData) => {
    const studentName = student.name || student.email || t("common.student");
    const confirmed = await confirmDestructiveAction(
      t("admin.classRosterRemoveTitle"),
      t("admin.classRosterRemoveMessage", {
        name: studentName,
        className,
      }),
      t("admin.classRosterRemoveConfirm"),
      t("common.cancel"),
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      await removeStudentFromClass(student.id, classId);
      showSuccessAlert(
        t("common.success"),
        t("admin.classRosterRemoved", { name: studentName }),
      );
      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("admin.operationFailed");
      showErrorAlert(t("common.error"), message);
    } finally {
      setBusy(false);
    }
  };

  const handleAddExisting = async () => {
    if (!selectedStudentId) {
      showErrorAlert(t("common.error"), t("admin.classRosterSelectStudent"));
      return;
    }

    const student = allStudents.find((s) => s.id === selectedStudentId);
    if (!student) {
      showErrorAlert(t("common.error"), t("admin.classRosterSelectStudent"));
      return;
    }

    const studentName = student.name || student.email || student.id;
    if (student.classId && student.classId !== classId) {
      const fromClass =
        classNameById.get(student.classId) || t("common.classFallback");
      const confirmed = await confirmAction(
        t("admin.classRosterMoveTitle"),
        t("admin.classRosterMoveMessage", {
          name: studentName,
          fromClass,
          toClass: className,
        }),
        t("admin.classRosterMoveConfirm"),
        t("common.cancel"),
      );
      if (!confirmed) return;
    }

    setBusy(true);
    try {
      await assignStudentToClass(selectedStudentId, classId);
      showSuccessAlert(
        t("common.success"),
        t("admin.classRosterAdded", { name: studentName }),
      );
      setSelectedStudentId("");
      setMode("list");
      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("admin.operationFailed");
      showErrorAlert(t("common.error"), message);
    } finally {
      setBusy(false);
    }
  };

  const handleCreateAndLink = async () => {
    setBusy(true);
    try {
      const studentId = await createUser({
        name,
        email,
        password,
        role: "student",
        phone: phone.trim(),
      });
      await assignStudentToClass(studentId, classId);
      showSuccessAlert(
        t("common.success"),
        t("admin.classRosterCreated", {
          name: name.trim() || email.trim(),
        }),
      );
      resetCreateForm();
      setMode("list");
      await onChanged?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("admin.createUserFailed");
      showErrorAlert(t("common.error"), message);
    } finally {
      setBusy(false);
    }
  };

  const clearImportFile = () => {
    setImportFileName(null);
    setImportRowCount(0);
    setImportRows(null);
  };

  const handleDownloadImportTemplate = async () => {
    setBusy(true);
    try {
      await shareClassStudentsImportTemplate();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error
          ? err.message
          : t("admin.couldNotDownloadTemplate"),
      );
    } finally {
      setBusy(false);
    }
  };

  const handlePickImportFile = async () => {
    setBusy(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [...EXCEL_DOCUMENT_PICKER_TYPES],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const asset = result.assets[0];
      const pickedName = asset.name ?? "students.xlsx";
      if (!isLikelyExcelFilename(pickedName)) {
        showErrorAlert(
          t("common.error"),
          t("admin.classRosterImportBadFile", { name: pickedName }),
        );
      }

      const webFile = (asset as { file?: Blob }).file;
      const buffer =
        Platform.OS === "web" && webFile
          ? await webFile.arrayBuffer()
          : await readExcelArrayBuffer(asset.uri);
      if (!buffer.byteLength) {
        throw new Error(t("admin.couldNotReadFile"));
      }

      const parsed = parseClassStudentsWorkbook(buffer);
      if (parsed.rows.length === 0) {
        clearImportFile();
        showErrorAlert(t("common.error"), t("admin.classRosterImportNoRows"));
        return;
      }

      setImportFileName(pickedName);
      setImportRowCount(parsed.rows.length);
      setImportRows(parsed.rows);
    } catch (err) {
      clearImportFile();
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.couldNotReadFile"),
      );
    } finally {
      setBusy(false);
    }
  };

  const formatImportSummary = (s: ImportSummary): string => {
    const err =
      s.errors.length > 0
        ? `\n${s.errors.slice(0, 5).join("\n")}${
            s.errors.length > 5
              ? t("admin.importMoreErrors", { count: s.errors.length - 5 })
              : ""
          }`
        : "";
    return `${t("admin.importSummary", {
      kind: t("admin.classRosterImportKind"),
      created: s.created,
      skipped: s.skipped,
    })}${err}`;
  };

  const handleRunImport = async () => {
    if (!importRows?.length) {
      showErrorAlert(t("common.error"), t("admin.classRosterImportPickFirst"));
      return;
    }

    const confirmed = await confirmAction(
      t("admin.excelConfirmTitle"),
      t("admin.classRosterImportConfirm", {
        count: importRowCount,
        className,
      }),
      t("common.import"),
      t("common.cancel"),
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const summary = await importStudentsIntoClass(importRows, classId, {
        defaultPassword: t("admin.defaultPassword"),
      });
      showSuccessAlert(t("common.success"), formatImportSummary(summary));
      clearImportFile();
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

  const toggleMode = (next: RosterMode) => {
    setMode((m) => (m === next ? "list" : next));
  };

  return (
    <View style={styles.root}>
      <Text style={styles.hint}>{t("admin.classStudentsHint")}</Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() => toggleMode("addExisting")}
          disabled={working}
          style={[
            styles.actionChip,
            mode === "addExisting"
              ? { backgroundColor: primary, borderColor: primary }
              : null,
          ]}
        >
          <Text
            style={[
              styles.actionChipText,
              mode === "addExisting" ? styles.actionChipTextActive : null,
            ]}
          >
            {t("admin.classRosterAddExisting")}
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
            {t("admin.classRosterCreateNew")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => toggleMode("importExcel")}
          disabled={working}
          style={[
            styles.actionChip,
            mode === "importExcel"
              ? { backgroundColor: primary, borderColor: primary }
              : null,
          ]}
        >
          <Text
            style={[
              styles.actionChipText,
              mode === "importExcel" ? styles.actionChipTextActive : null,
            ]}
          >
            {t("admin.classRosterImportExcel")}
          </Text>
        </Pressable>
      </View>

      {mode === "addExisting" ? (
        <View style={styles.formBlock}>
          <Text style={styles.formTitle}>
            {t("admin.classRosterAddExistingTitle")}
          </Text>
          <Text style={styles.formHint}>
            {t("admin.classRosterAddExistingHint")}
          </Text>
          <Selector
            title={t("admin.classRosterSelectStudent")}
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
            label={t("admin.classRosterAddToClass")}
            onPress={handleAddExisting}
            loading={working}
            disabled={working || !selectedStudentId}
          />
        </View>
      ) : null}

      {mode === "createNew" ? (
        <View style={styles.formBlock}>
          <Text style={styles.formTitle}>
            {t("admin.classRosterCreateNewTitle")}
          </Text>
          <Text style={styles.formHint}>
            {t("admin.classRosterCreateNewHint")}
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
          <TextInput
            placeholder={t("admin.phonePlaceholder")}
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
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
          <SchoolThemeButton
            label={t("admin.classRosterCreateAndLink")}
            onPress={handleCreateAndLink}
            loading={working}
            disabled={working}
          />
        </View>
      ) : null}

      {mode === "importExcel" ? (
        <View style={styles.formBlock}>
          <Text style={styles.formTitle}>
            {t("admin.classRosterImportTitle")}
          </Text>
          <Text style={styles.formHint}>
            {t("admin.classRosterImportHint", { className })}
          </Text>
          <SchoolThemeButton
            label={t("admin.classRosterImportDownloadTemplate")}
            onPress={handleDownloadImportTemplate}
            loading={working}
            disabled={working}
          />
          <SchoolThemeButton
            label={t("admin.classRosterImportPickFile")}
            onPress={handlePickImportFile}
            loading={working}
            disabled={working}
          />
          {importFileName ? (
            <Text style={styles.tempHint}>
              {t("admin.classRosterImportFileReady", {
                name: importFileName,
                count: importRowCount,
              })}
            </Text>
          ) : null}
          <SchoolThemeButton
            label={t("admin.classRosterImportRun")}
            onPress={handleRunImport}
            loading={working}
            disabled={working || !importRows?.length}
          />
        </View>
      ) : null}

      <AdminClassStudentNamesList
        students={classStudents}
        loading={loading}
        onSelectStudent={onSelectStudent}
        onRemoveStudent={handleRemove}
        removeDisabled={working}
      />
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
    marginBottom: 2,
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
