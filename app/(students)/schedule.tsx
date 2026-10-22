import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { AuthContext } from "../../src/context/authContext";
import { useStudentDashboardData } from "../../hooks/useStudentDashboardData";
import { useStudentDashboardDerivedData } from "../../components/dashboard/useStudentDashboardDerivedData";
import { DashboardScheduleSection } from "../../components/dashboard/DashboardScheduleSection";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { getTodayDayKey, getWeekdayLabel } from "../../src/utils/scheduleFormat";
import { FLOATING_TAB_BAR_INSET } from "../../src/constants/tabBar";

export default function StudentScheduleScreen() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);
  const { schedule, refreshing, onRefresh } = useStudentDashboardData(
    user?.uid,
    userData?.classId,
    user?.uid
      ? { userId: user.uid, role: "student", studentId: user.uid }
      : undefined,
  );

  const { visibleSchedule, currentScheduleId, scheduleNow } =
    useStudentDashboardDerivedData({
      schedule,
      homework: [],
      exams: [],
    });

  const todayLabel = getWeekdayLabel(t, getTodayDayKey(scheduleNow));

  return (
    <StudentScreenShell
      title={t("tabs.student.schedule")}
      subtitle={t("dashboard.scheduleWeeklyTitle", { day: todayLabel })}
      showMenu={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerStyle={{ paddingBottom: FLOATING_TAB_BAR_INSET + 24 }}
    >
      <View style={{ width: "100%" }}>
        <DashboardScheduleSection
          schedule={schedule}
          visibleSchedule={visibleSchedule}
          currentScheduleId={currentScheduleId}
          classId={userData?.classId ?? null}
          todayLabel={todayLabel}
          scheduleNow={scheduleNow}
        />
      </View>
    </StudentScreenShell>
  );
}
