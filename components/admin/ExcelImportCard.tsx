import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ImportMode,
  useAdminExcelImport,
} from "../../hooks/useAdminExcelImport";
import {
  IMPORT_FORMAT_HINTS,
  IMPORT_KINDS,
  ImportKind,
  ImportSummary,
} from "../../src/services/adminExcelImport";

interface ExcelImportCardProps {
  onImportComplete?: () => void | Promise<void>;
}

export const ExcelImportCard: React.FC<ExcelImportCardProps> = ({
  onImportComplete,
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ImportMode>("workbook");
  const [selectedKind, setSelectedKind] = useState<ImportKind>("classes");
  const {
    loading,
    error,
    parsed,
    fileName,
    importableRowCount,
    canImport,
    pickExcelFile,
    importSheet,
    importWorkbook,
    downloadTemplate,
    clearFile,
  } = useAdminExcelImport();

  const formatSummary = (s: ImportSummary): string => {
    const err =
      s.errors.length > 0
        ? `\n${s.errors.slice(0, 5).join("\n")}${
            s.errors.length > 5
              ? t("admin.importMoreErrors", { count: s.errors.length - 5 })
              : ""
          }`
        : "";
    return `${t("admin.importSummary", {
      kind: s.kind,
      created: s.created,
      skipped: s.skipped,
    })}${err}`;
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate(mode, mode === "sheet" ? selectedKind : undefined);
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.couldNotDownloadTemplate"),
      );
    }
  };

  const handlePickFile = async () => {
    try {
      await pickExcelFile(mode, mode === "sheet" ? selectedKind : undefined);
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.couldNotReadFile"),
      );
    }
  };

  const handleImport = () => {
    Alert.alert(
      t("admin.excelConfirmTitle"),
      mode === "workbook"
        ? t("admin.excelConfirmWorkbook")
        : t("admin.excelConfirmSheet", { kind: selectedKind }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.import"),
          onPress: async () => {
            try {
              if (mode === "workbook") {
                const results = await importWorkbook();
                const msg = results.map(formatSummary).join("\n\n");
                Alert.alert(
                  t("admin.importCompleted"),
                  msg || t("admin.importNoRows"),
                );
              } else {
                const result = await importSheet(selectedKind);
                Alert.alert(t("admin.importCompleted"), formatSummary(result));
              }
              await onImportComplete?.();
            } catch (err) {
              Alert.alert(
                t("common.error"),
                err instanceof Error ? err.message : t("admin.importFailed"),
              );
            }
          },
        },
      ],
    );
  };

  const sheetPreview = parsed
    ? IMPORT_KINDS.filter((k) => (parsed.sheets[k]?.length ?? 0) > 0)
        .map((k) => `${k}: ${parsed.sheets[k]?.length ?? 0}`)
        .join(" · ")
    : null;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t("admin.excelImport")}</Text>
      <Text style={styles.hint}>{t("admin.excelHint")}</Text>

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeChip, mode === "workbook" && styles.modeChipActive]}
          onPress={() => setMode("workbook")}
          disabled={loading}
        >
          <Text
            style={[
              styles.modeChipText,
              mode === "workbook" && styles.modeChipTextActive,
            ]}
          >
            {t("admin.fullWorkbook")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeChip, mode === "sheet" && styles.modeChipActive]}
          onPress={() => setMode("sheet")}
          disabled={loading}
        >
          <Text
            style={[
              styles.modeChipText,
              mode === "sheet" && styles.modeChipTextActive,
            ]}
          >
            {t("admin.singleSheet")}
          </Text>
        </TouchableOpacity>
      </View>

      {mode === "sheet" && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.kindScroll}
        >
          {IMPORT_KINDS.map((kind) => (
            <TouchableOpacity
              key={kind}
              style={[
                styles.kindChip,
                selectedKind === kind && styles.kindChipActive,
              ]}
              onPress={() => setSelectedKind(kind)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.kindChipText,
                  selectedKind === kind && styles.kindChipTextActive,
                ]}
              >
                {kind}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Text style={styles.formatHint}>
        {mode === "sheet"
          ? IMPORT_FORMAT_HINTS[selectedKind]
          : t("admin.workbookSheetsList")}
      </Text>

      <TouchableOpacity
        style={styles.templateButton}
        onPress={handleDownloadTemplate}
        disabled={loading}
      >
        <Text style={styles.templateButtonText}>
          {mode === "workbook"
            ? t("admin.downloadFullTemplate")
            : t("admin.downloadSheetTemplate", { kind: selectedKind })}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handlePickFile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#1E3A8A" />
        ) : (
          <Text style={styles.secondaryButtonText}>
            {fileName
              ? t("admin.fileLabel", { name: fileName })
              : t("admin.chooseExcelFile")}
          </Text>
        )}
      </TouchableOpacity>

      {sheetPreview ? (
        <Text style={styles.preview}>{sheetPreview}</Text>
      ) : fileName && importableRowCount === 0 ? (
        <Text style={styles.warn}>{t("admin.noImportableRows")}</Text>
      ) : null}

      {parsed?.unknownSheets?.length ? (
        <Text style={styles.warn}>
          {t("admin.unrecognizedSheets", {
            sheets: parsed.unknownSheets.join(", "),
          })}
        </Text>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.actions}>
        {fileName ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearFile}
            disabled={loading}
          >
            <Text style={styles.clearButtonText}>{t("common.clear")}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[
            styles.button,
            (!canImport || loading) && styles.buttonDisabled,
          ]}
          onPress={handleImport}
          disabled={!canImport || loading}
        >
          <Text style={styles.buttonText}>{t("admin.runImport")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  hint: {
    fontSize: 13,
    color: "#666",
    marginBottom: 14,
    lineHeight: 20,
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
  },
  modeChipActive: {
    backgroundColor: "#1E3A8A",
    borderColor: "#1E3A8A",
  },
  modeChipText: {
    fontWeight: "600",
    color: "#334155",
  },
  modeChipTextActive: {
    color: "white",
  },
  kindScroll: {
    marginBottom: 10,
    maxHeight: 44,
  },
  kindChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginRight: 8,
  },
  kindChipActive: {
    backgroundColor: "#1E3A8A",
    borderColor: "#1E3A8A",
  },
  kindChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  kindChipTextActive: {
    color: "white",
  },
  formatHint: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
    fontStyle: "italic",
  },
  templateButton: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  templateButtonText: {
    color: "#1E3A8A",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#1E3A8A",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
    minHeight: 48,
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#1E3A8A",
    fontWeight: "600",
    fontSize: 15,
  },
  preview: {
    fontSize: 12,
    color: "#334155",
    marginBottom: 8,
  },
  warn: {
    fontSize: 12,
    color: "#B45309",
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  clearButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  clearButtonText: {
    color: "#64748B",
    fontWeight: "600",
  },
  button: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  errorText: {
    color: "#DC2626",
    marginBottom: 10,
    fontSize: 14,
  },
});
