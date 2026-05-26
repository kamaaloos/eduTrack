import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useContext, useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { ReportCardView } from "../../components/report/ReportCardView";
import { generateReportCard } from "../../src/services/reportCardEngine";
import type { ReportCardData } from "../../src/services/reportCardEngine";

export default function ReportCardScreen() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const [report, setReport] = useState<ReportCardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;

      setError(null);
      try {
        const data = await generateReportCard(user.uid, {
          classId: userData?.classId ?? null,
        });
        setReport(data);
      } catch (err) {
        console.error("Failed to load report card:", err);
        setError(t("common.connectionError"));
        setReport({
          studentName: t("common.student"),
          classId: null,
          subjects: [],
          average: 0,
          grade: "N/A",
          exams: [],
        });
      }
    };

    load();
  }, [user?.uid, userData?.classId, t]);

  if (!report && !error) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  if (error && !report?.exams.length && !report?.subjects.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>{t("student.reportCard")}</Text>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!report) return null;

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <ReportCardView report={report} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#EEF2FF",
  },
  loadingText: { marginTop: 12, color: "#64748B", fontSize: 15 },
  errorTitle: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  error: { color: "#DC2626", fontSize: 15, textAlign: "center" },
});
