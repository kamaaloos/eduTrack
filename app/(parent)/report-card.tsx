import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { useParentChild } from "../../src/context/parentChildContext";
import { ReportCardView } from "../../components/report/ReportCardView";
import { generateReportCard } from "../../src/services/reportCardEngine";
import type { ReportCardData } from "../../src/services/reportCardEngine";

export default function ParentReportCardTab() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { selectedChild } = useParentChild();
  const [report, setReport] = useState<ReportCardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const studentId = selectedChild?.id ?? "";

  useEffect(() => {
    if (!studentId || !user?.uid) {
      setReport(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setError(null);
      setReport(null);
      try {
        const data = await generateReportCard(studentId, {
          classId: selectedChild?.classId ?? null,
          studentName: selectedChild?.name,
          parentId: user.uid,
          markParentSeen: true,
        });
        if (!cancelled) setReport(data);
      } catch (err) {
        console.error("Parent report card:", err);
        if (!cancelled) setError(t("common.connectionError"));
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [studentId, user?.uid, selectedChild?.classId, selectedChild?.name, t]);

  if (!selectedChild) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <Text style={styles.emptyTitle}>{t("parent.selectChild")}</Text>
        <Text style={styles.emptyText}>{t("parent.dashboardSubtitle")}</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push("/(parent)/dashboard")}
        >
          <Text style={styles.emptyButtonText}>{t("tabs.parent.home")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!report && !error) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingLabel}>{t("common.loading")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }

  return report ? <ReportCardView report={report} /> : null;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "transparent",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  loadingLabel: { marginTop: 12, color: "#64748B", fontSize: 14 },
  error: { color: "#DC2626", fontSize: 15, textAlign: "center" },
});
