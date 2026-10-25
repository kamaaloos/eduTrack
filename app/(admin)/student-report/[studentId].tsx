import { useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AdminScreenShell } from "../../../components/admin/AdminScreenShell";
import { ReportCardView } from "../../../components/report/ReportCardView";
import { studentScreenStyles } from "../../../components/students/studentScreenStyles";
import { AuthContext } from "../../../src/context/authContext";
import { useSchoolTheme } from "../../../src/context/schoolThemeContext";
import {
  generateReportCard,
  type ReportCardData,
} from "../../../src/services/reportCardEngine";

export default function AdminStudentReportScreen() {
  const { t } = useTranslation();
  const { theme } = useSchoolTheme();
  const { user } = useContext(AuthContext);
  const { studentId, name, classId: paramClassId } = useLocalSearchParams<{
    studentId: string;
    name?: string;
    classId?: string;
  }>();
  const id = String(studentId ?? "");
  const [report, setReport] = useState<ReportCardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const displayName = name ? String(name) : report?.studentName;

  const load = useCallback(async () => {
    if (!id || !user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateReportCard(id, {
        classId: paramClassId ? String(paramClassId) : null,
        studentName: name ? String(name) : undefined,
      });
      setReport(data);
    } catch (err) {
      console.error("Admin student report:", err);
      setError(t("admin.studentReportLoadError"));
    } finally {
      setLoading(false);
    }
  }, [id, user?.uid, paramClassId, name, t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminScreenShell
      title={t("reportCard.heroEyebrow")}
      subtitle={displayName || t("admin.studentReportTitle")}
      showBack
    >
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primaryColor} />
          <Text style={styles.loadingText}>{t("admin.studentReportLoading")}</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => void load()}>
            <Text style={[styles.retryText, { color: theme.primaryColor }]}>
              {t("common.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : report ? (
        <View style={studentScreenStyles.reportShellContent}>
          <ReportCardView report={report} showParentSeen embedded />
        </View>
      ) : null}
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  loadingText: {
    color: "#64748B",
    fontWeight: "600",
  },
  error: {
    color: "#B91C1C",
    fontWeight: "600",
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  retryText: {
    fontWeight: "700",
    fontSize: 15,
  },
});
