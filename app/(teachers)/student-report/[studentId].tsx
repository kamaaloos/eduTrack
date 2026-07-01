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
import { ReportCardView } from "../../../components/report/ReportCardView";
import { TeacherScreenShell } from "../../../components/teachers/TeacherScreenShell";
import { studentScreenStyles } from "../../../components/students/studentScreenStyles";
import { AuthContext } from "../../../src/context/authContext";
import { generateReportCard } from "../../../src/services/reportCardEngine";
import type { ReportCardData } from "../../../src/services/reportCardEngine";

export default function TeacherStudentReportScreen() {
  const { t } = useTranslation();
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
      console.error("Teacher student report:", err);
      setError(t("teacher.studentReport.loadError"));
    } finally {
      setLoading(false);
    }
  }, [id, user?.uid, paramClassId, name, t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <TeacherScreenShell
      title={t("reportCard.heroEyebrow")}
      subtitle={displayName || t("teacher.studentReport.title")}
      showBack
      scroll={false}
    >
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>
            {t("teacher.studentReport.loading")}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => void load()}>
            <Text style={styles.retryText}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : report ? (
        <View style={studentScreenStyles.reportShellContent}>
          <ReportCardView report={report} showParentSeen embedded />
        </View>
      ) : null}
    </TeacherScreenShell>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { marginTop: 12, color: "#64748B" },
  error: { color: "#DC2626", textAlign: "center", marginBottom: 16 },
  retryBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: { color: "#FFFFFF", fontWeight: "700" },
});
