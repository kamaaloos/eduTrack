import * as DocumentPicker from "expo-document-picker";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  parseWorkbookFromArrayBuffer,
  runImportKind,
} from "../../src/services/adminExcelImport";
import { shareScheduleImportTemplate } from "../../src/services/scheduleExcelTemplate";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import {
  confirmAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";
import {
  EXCEL_DOCUMENT_PICKER_TYPES,
  isLikelyExcelFilename,
  readExcelArrayBuffer,
} from "../../src/utils/readExcelFile";

type ClassScheduleBulkImportProps = {
  onImported?: () => void | Promise<void>;
};

export function ClassScheduleBulkImport({
  onImported,
}: ClassScheduleBulkImportProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, unknown>[]>([]);

  const clearFile = () => {
    setFileName(null);
    setParsedRows([]);
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      await shareScheduleImportTemplate();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.couldNotDownloadTemplate"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePick = useCallback(async () => {
    setLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [...EXCEL_DOCUMENT_PICKER_TYPES],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const asset = result.assets[0];
      const pickedName = asset.name ?? "schedule.xlsx";

      if (!isLikelyExcelFilename(pickedName)) {
        showErrorAlert(t("common.error"), t("admin.scheduleExcelWrongType"));
        return;
      }

      const webFile = (asset as { file?: Blob }).file;
      const buffer =
        Platform.OS === "web" && webFile
          ? await webFile.arrayBuffer()
          : await readExcelArrayBuffer(asset.uri);

      const parsed = parseWorkbookFromArrayBuffer(buffer, "schedule");
      const rows = parsed.sheets.schedule ?? [];
      setFileName(pickedName);
      setParsedRows(rows);

      if (rows.length === 0) {
        showErrorAlert(
          t("admin.scheduleExcelEmptyTitle"),
          t("admin.scheduleExcelEmptyHint"),
        );
      }
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.couldNotReadFile"),
      );
      clearFile();
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleImport = async () => {
    if (!fileName || parsedRows.length === 0) return;

    const confirmed = await confirmAction(
      t("admin.scheduleBulkConfirmTitle"),
      t("admin.scheduleBulkConfirmMessage", { count: parsedRows.length }),
      t("common.import"),
      t("common.cancel"),
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const summary = await runImportKind("schedule", parsedRows);

      const err =
        summary.errors.length > 0
          ? `\n${summary.errors.slice(0, 5).join("\n")}${
              summary.errors.length > 5
                ? `\n…+${summary.errors.length - 5} more`
                : ""
            }`
          : "";

      showSuccessAlert(
        t("admin.importCompleted"),
        t("admin.scheduleBulkResult", {
          created: summary.created,
          skipped: summary.skipped,
        }) + err,
      );

      clearFile();
      await onImported?.();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.importFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.box}>
      <Text style={styles.title}>{t("admin.scheduleBulkTitle")}</Text>
      <Text style={styles.hint}>{t("admin.scheduleBulkHint")}</Text>

      <TouchableOpacity
        style={styles.templateBtn}
        onPress={() => void handleDownload()}
        disabled={loading}
      >
        <Text style={styles.templateBtnText}>
          {t("admin.scheduleBulkDownload")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pickBtn}
        onPress={() => void handlePick()}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#1E3A8A" />
        ) : (
          <Text style={styles.pickBtnText}>
            {fileName
              ? t("admin.fileLabel", { name: fileName })
              : t("admin.scheduleBulkChooseFile")}
          </Text>
        )}
      </TouchableOpacity>

      {parsedRows.length > 0 ? (
        <Text style={styles.preview}>
          {t("admin.scheduleBulkPreview", { count: parsedRows.length })}
        </Text>
      ) : null}

      <View style={styles.actions}>
        {fileName ? (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={clearFile}
            disabled={loading}
          >
            <Text style={styles.clearBtnText}>{t("common.clear")}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[
            styles.importBtn,
            (loading || parsedRows.length === 0) && styles.importBtnDisabled,
          ]}
          onPress={() => void handleImport()}
          disabled={loading || parsedRows.length === 0}
        >
          <Text style={styles.importBtnText}>{t("admin.scheduleBulkImport")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 6 },
  hint: { fontSize: 13, color: "#64748B", lineHeight: 18, marginBottom: 12 },
  templateBtn: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
  },
  templateBtnText: { color: "#1E3A8A", fontWeight: "600", fontSize: 14 },
  pickBtn: {
    borderWidth: 1,
    borderColor: "#1E3A8A",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  pickBtnText: { color: "#1E3A8A", fontWeight: "600", fontSize: 14 },
  preview: { fontSize: 12, color: "#334155", marginBottom: 10 },
  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  clearBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  clearBtnText: { color: "#64748B", fontWeight: "600" },
  importBtn: {
    flex: 1,
    backgroundColor: "#1E3A8A",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  importBtnDisabled: { opacity: 0.55 },
  importBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});
