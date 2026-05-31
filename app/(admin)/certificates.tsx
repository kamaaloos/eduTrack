import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { AdminScreenShell } from "../../components/admin/AdminScreenShell";
import { SelectChips } from "../../components/teachers/SelectChips";
import { useAdminDataContext } from "../../src/context/adminDataContext";
import { useSchoolContext } from "../../src/context/schoolContext";
import {
  getPdfShareErrorKey,
  getYearlyCertificateLabels,
  shareYearlyClassCertificatesPdf,
} from "../../src/services/certificatePdfService";
import {
  formatAcademicYear,
  listAcademicYearStarts,
} from "../../src/utils/academicYear";

export default function AdminCertificatesScreen() {
  const { t } = useTranslation();
  const { classes, classesLoading, loadClasses } = useAdminDataContext();
  const { selectedSchool } = useSchoolContext();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [academicYearStart, setAcademicYearStart] = useState(
    listAcademicYearStarts(1)[0],
  );
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    void loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const classOptions = useMemo(
    () =>
      classes.map((item) => ({
        value: item.id,
        label: item.name || t("common.class"),
      })),
    [classes, t],
  );

  const yearOptions = useMemo(
    () =>
      listAcademicYearStarts(4).map((startYear) => ({
        value: String(startYear),
        label: formatAcademicYear(startYear),
      })),
    [],
  );

  const selectedClass = classes.find((item) => item.id === selectedClassId);

  const handleExport = useCallback(async () => {
    if (!selectedClassId || !selectedClass) {
      Alert.alert(
        t("certificates.selectClassTitle"),
        t("certificates.selectClassHint"),
      );
      return;
    }

    setExporting(true);
    try {
      const count = await shareYearlyClassCertificatesPdf(
        selectedSchool?.name || t("certificates.schoolFallback"),
        selectedClassId,
        selectedClass.name || t("common.class"),
        academicYearStart,
        getYearlyCertificateLabels(t),
      );
      Alert.alert(
        t("certificates.exportReadyTitle"),
        t("certificates.exportReadyMessage", { count }),
      );
    } catch (err) {
      Alert.alert(t("common.error"), t(getPdfShareErrorKey(err)));
    } finally {
      setExporting(false);
    }
  }, [
    selectedClassId,
    selectedClass,
    selectedSchool?.name,
    academicYearStart,
    t,
  ]);

  return (
    <AdminScreenShell
      title={t("certificates.adminTitle")}
      subtitle={t("certificates.adminSubtitle")}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("certificates.yearlyTitle")}</Text>
          <Text style={styles.cardHint}>{t("certificates.adminHint")}</Text>

          {classesLoading ? (
            <ActivityIndicator color="#2563EB" style={styles.loader} />
          ) : classes.length === 0 ? (
            <Text style={styles.empty}>{t("certificates.noClasses")}</Text>
          ) : (
            <>
              <Text style={styles.label}>{t("common.class")}</Text>
              <SelectChips
                options={classOptions}
                selectedValue={selectedClassId}
                onSelect={setSelectedClassId}
              />

              <Text style={styles.label}>{t("certificates.academicYear")}</Text>
              <SelectChips
                options={yearOptions}
                selectedValue={String(academicYearStart)}
                onSelect={(value) => setAcademicYearStart(Number(value))}
              />

              <TouchableOpacity
                style={[styles.exportBtn, exporting && styles.exportBtnDisabled]}
                onPress={() => void handleExport()}
                disabled={exporting}
              >
                {exporting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.exportBtnText}>
                      {t("certificates.exportYearlyPdf")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  cardHint: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
    marginTop: 8,
  },
  loader: { marginVertical: 24 },
  empty: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
  },
  exportBtn: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1E3A8A",
    borderRadius: 14,
    paddingVertical: 14,
  },
  exportBtnDisabled: { opacity: 0.7 },
  exportBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
