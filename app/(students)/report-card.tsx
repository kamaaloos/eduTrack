import { ActivityIndicator, Text, View } from "react-native";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { ReportCardView } from "../../components/report/ReportCardView";
import { generateReportCard } from "../../src/services/reportCardEngine";
import type { ReportCardData } from "../../src/services/reportCardEngine";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { studentScreenStyles as styles } from "../../components/students/studentScreenStyles";

export default function ReportCardScreen() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);
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
      <StudentScreenShell title={t("student.reportCard")} showMenu scroll={false}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      </StudentScreenShell>
    );
  }

  if (error && !report?.exams.length && !report?.subjects.length) {
    return (
      <StudentScreenShell title={t("student.reportCard")} showMenu>
        <Text style={styles.emptyText}>{error}</Text>
      </StudentScreenShell>
    );
  }

  if (!report) return null;

  return (
    <StudentScreenShell title={t("student.reportCard")} showMenu scroll={false}>
      <ReportCardView report={report} embedded />
    </StudentScreenShell>
  );
}
