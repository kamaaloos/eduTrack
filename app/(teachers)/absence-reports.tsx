import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SelectChips } from "../../components/teachers/SelectChips";
import { useTeacherClassesContext } from "../../src/context/teacherClassesContext";
import {
  loadAbsenceReportsForTeacher,
  type TeacherAbsenceReport,
} from "../../src/services/teacherAbsenceReports";
import { getAbsenceReasonLabel } from "../../src/utils/attendanceLabels";

export default function TeacherAbsenceReportsScreen() {
  const { t } = useTranslation();
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    loading: loadingClasses,
    teacherId,
  } = useTeacherClassesContext();

  const [reports, setReports] = useState<TeacherAbsenceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatWhen = useCallback(
    (date: Date | null) => {
      if (!date) return t("teacher.absenceReports.justSubmitted");
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    [t],
  );

  const classOptions = useMemo(
    () => [
      { value: "", label: t("teacher.absenceReports.allClasses") },
      ...classes.map((c) => ({
        value: c.id,
        label: c.name || t("common.class"),
      })),
    ],
    [classes, t],
  );

  const load = useCallback(async () => {
    if (!teacherId) return;
    setError(null);
    try {
      const list = await loadAbsenceReportsForTeacher(
        teacherId,
        selectedClassId || undefined,
      );
      setReports(list);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("teacher.absenceReports.loadError"),
      );
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [teacherId, selectedClassId, t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const renderItem = ({ item }: { item: TeacherAbsenceReport }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name="medkit" size={20} color="#1E40AF" />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Text style={styles.meta}>{formatWhen(item.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.reason}>
        {getAbsenceReasonLabel(t, item.reasonCode, item.reason)}
      </Text>
      {item.notes ? (
        <Text style={styles.notes}>{item.notes}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Text style={styles.pageTitle}>{t("teacher.absenceReports.pageTitle")}</Text>
      <Text style={styles.intro}>{t("teacher.absenceReports.intro")}</Text>

      {loadingClasses ? (
        <ActivityIndicator style={styles.loader} color="#1E40AF" />
      ) : (
        <SelectChips
          options={classOptions}
          selectedValue={selectedClassId}
          onSelect={setSelectedClassId}
          emptyMessage={t("teacher.absenceReports.noClassesAssigned")}
        />
      )}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading && !refreshing ? (
        <ActivityIndicator style={styles.loader} size="large" color="#1E40AF" />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Ionicons name="document-text-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>
                  {t("teacher.absenceReports.emptyTitle")}
                </Text>
                <Text style={styles.emptyText}>
                  {t("teacher.absenceReports.emptyText")}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  intro: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 14,
    lineHeight: 20,
  },
  loader: { marginVertical: 24 },
  list: { paddingBottom: 120, gap: 12 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#1E40AF",
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderText: { flex: 1 },
  studentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  meta: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  reason: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  notes: {
    marginTop: 8,
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: "#B91C1C", fontWeight: "600" },
});
