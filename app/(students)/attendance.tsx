import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useContext } from "react";
import { fetchStudentAttendanceHistory } from "../../src/services/attendanceQueries";
import { AuthContext } from "../../src/context/authContext";
import { getAttendanceColor } from "../../src/utils/dashboardUi";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { studentScreenStyles as styles } from "../../components/students/studentScreenStyles";

export default function AttendanceScreen() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
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
    <StudentScreenShell
      title={t("student.attendanceTitle")}
      subtitle={t("common.last90Days")}
      showMenu
    >
      {records.length === 0 ? (
        <Text style={styles.emptyText}>{t("student.noAttendance")}</Text>
      ) : (
        records.map((r) => {
          const colors = getAttendanceColor(r.status, r.parentResponse);
          return (
            <View
              key={r.id}
              style={[styles.listCard, { borderLeftWidth: 4, borderLeftColor: colors.border }]}
            >
              <Text style={styles.listCardTitle}>{r.date}</Text>
              <Text style={[styles.listCardBody, { color: colors.text, fontWeight: "700" }]}>
                {colors.label}
              </Text>
              {r.parentResponse?.reason ? (
                <Text style={[styles.listCardBody, { marginTop: 6 }]}>
                  {t("common.parent")}: {r.parentResponse.reason}
                </Text>
              ) : null}
              {r.remark ? (
                <Text style={[styles.listCardBody, { marginTop: 6 }]}>
                  {t("common.remarks")}: {r.remark}
                </Text>
              ) : null}
            </View>
          );
        })
      )}
    </StudentScreenShell>
  );
}
