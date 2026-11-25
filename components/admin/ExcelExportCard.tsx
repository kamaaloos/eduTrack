import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { useAdminData } from "../../src/context/adminDataContext";
import { exportStudentsParentsWorkbook } from "../../src/services/adminExcelExport";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";
import { platformShadow } from "../../src/utils/platformShadow";
import { innerCardBorderStyle } from "../../src/constants/innerCardBorders";
import { SchoolThemeButton } from "../common/SchoolThemeButton";

type ExcelExportCardProps = {
  onExportComplete?: () => void | Promise<void>;
};

export function ExcelExportCard({ onExportComplete }: ExcelExportCardProps) {
  const { t } = useTranslation();
  const { students, parents } = useAdminData();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const summary = await exportStudentsParentsWorkbook();
      showSuccessAlert(
        t("common.success"),
        t("admin.excelExportSuccess", {
          students: summary.students,
          parents: summary.parents,
          links: summary.parentStudentLinks,
          filename: summary.filename,
        }),
      );
      await onExportComplete?.();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.excelExportFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("admin.excelExportTitle")}</Text>
      <Text style={styles.hint}>{t("admin.excelExportHint")}</Text>
      <Text style={styles.meta}>
        {t("admin.excelExportCounts", {
          students: students.length,
          parents: parents.length,
        })}
      </Text>
      <SchoolThemeButton
        label={t("admin.excelExportAction")}
        onPress={() => void handleExport()}
        loading={loading}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    gap: 10,
    ...innerCardBorderStyle,
    ...platformShadow("md"),
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  hint: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },
  meta: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
  },
});
