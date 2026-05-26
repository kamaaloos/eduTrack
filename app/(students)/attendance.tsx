import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { useEffect, useState, useContext } from "react";

import { fetchStudentAttendanceHistory } from "../../src/services/attendanceQueries";
import { AuthContext } from "../../src/context/authContext";
import { getAttendanceColor } from "../../src/utils/dashboardUi";

export default function AttendanceScreen() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const loadAttendance = async () => {
      if (!user?.uid) return;

      try {
        const data = await fetchStudentAttendanceHistory(user.uid);
        setRecords(data);
      } catch (err) {
        console.error("Failed to load attendance:", err);
        setRecords([]);
      }
    };

    loadAttendance();
  }, [user?.uid]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 120,
      }}
    >
      <Text style={styles.title}>{t("student.attendanceTitle")}</Text>
      <Text style={styles.subtitle}>{t("common.last90Days")}</Text>

      {records.length === 0 && (
        <Text style={styles.empty}>{t("student.noAttendance")}</Text>
      )}

      {records.map((r) => {
        const colors = getAttendanceColor(r.status, r.parentResponse);
        return (
          <View
            key={r.id}
            style={[styles.card, { borderLeftColor: colors.border }]}
          >
            <Text style={styles.date}>{r.date}</Text>

            <Text style={[styles.status, { color: colors.text }]}>
              {colors.label}
            </Text>

            {r.parentResponse?.reason ? (
              <Text style={styles.remark}>
                Parent: {r.parentResponse.reason}
              </Text>
            ) : null}
            {r.remark && <Text style={styles.remark}>Remark: {r.remark}</Text>}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F7FA",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },

  date: {
    fontSize: 16,
    fontWeight: "700",
  },

  status: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: "600",
  },

  remark: {
    marginTop: 5,
    color: "#666",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#888",
  },
});
