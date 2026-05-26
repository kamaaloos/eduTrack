import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReportCardView } from "../../../components/report/ReportCardView";
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
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.wrap} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#1E40AF" />
          <Text style={styles.backText}>{t("teacher.studentReport.back")}</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          {name
            ? String(name)
            : report?.studentName || t("teacher.studentReport.title")}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>{t("teacher.studentReport.loading")}</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : report ? (
        <ReportCardView report={report} showParentSeen />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "transparent" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
    backgroundColor: "transparent",
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  backText: { color: "#1E40AF", fontWeight: "700", fontSize: 15 },
  topTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
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
