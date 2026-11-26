import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { DashboardScheduleSection } from "../../../../components/dashboard/DashboardScheduleSection";
import { useStudentDashboardDerivedData } from "../../../../components/dashboard/useStudentDashboardDerivedData";
import { StudentScreenShell } from "../../../../components/students/StudentScreenShell";
import { useParentChildRoute } from "../../../../hooks/useParentChildRoute";
import { useStudentDashboardData } from "../../../../hooks/useStudentDashboardData";
import { FLOATING_TAB_BAR_INSET } from "../../../../src/constants/tabBar";
import { AuthContext } from "../../../../src/context/authContext";
import { getTodayDayKey, getWeekdayLabel } from "../../../../src/utils/scheduleFormat";

export default function ParentChildScheduleScreen() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { studentId, classId, displayName } = useParentChildRoute();
  const { schedule, refreshing, onRefresh } = useStudentDashboardData(
    studentId,
    classId,
    user?.uid
      ? { userId: user.uid, role: "parent", studentId }
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
      subtitle={
        displayName
          ? `${displayName} · ${t("dashboard.scheduleWeeklyTitle", { day: todayLabel })}`
          : t("dashboard.scheduleWeeklyTitle", { day: todayLabel })
      }
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
          classId={classId}
          todayLabel={todayLabel}
          scheduleNow={scheduleNow}
        />
      </View>
    </StudentScreenShell>
  );
}
