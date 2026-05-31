import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView, View } from "react-native";
import { useUnreadNotificationCount } from "../../hooks/useNotifications";
import { AuthContext } from "../../src/context/authContext";
import { getTodayDayKey, getWeekdayLabel } from "../../src/utils/scheduleFormat";
import { DashboardAbsenceReportSection } from "./DashboardAbsenceReportSection";
import { DashboardAnnouncementsSection } from "./DashboardAnnouncementsSection";
import { DashboardExamsSection } from "./DashboardExamsSection";
import { DashboardHeader, useDashboardLogout } from "./DashboardHeader";
import { DashboardHomeworkSection } from "./DashboardHomeworkSection";
import { DashboardRemarksSection } from "./DashboardRemarksSection";
import { DashboardScheduleSection } from "./DashboardScheduleSection";
import { dashboardStyles as styles } from "./dashboardStyles";
import type { StudentDashboardViewProps } from "./studentDashboardTypes";
import { useStudentDashboardDerivedData } from "./useStudentDashboardDerivedData";
import { useStudentDashboardNavigation } from "./useStudentDashboardNavigation";

export type { StudentDashboardViewProps } from "./studentDashboardTypes";

export function StudentDashboardView({
  studentId,
  classId,
  displayName,
  photoURL,
  routePrefix = "/(students)",
  showNotifications = true,
  showHeaderLogout = false,
  onMenuPress,
  showAbsenceReport = false,
  showHealthCheck = false,
  onHealthCheckPress,
  parentId,
  headerSubtitle,
  hideViewAllRoutes = false,
  useParentRoutes = false,
  refreshing,
  onRefresh,
  messages,
  homework,
  exams,
  schedule,
  remarksAndAttendance,
  gradedExamIds,
}: StudentDashboardViewProps) {
  const { t } = useTranslation();
  const { logout, user } = useContext(AuthContext);
  const notificationUnreadCount = useUnreadNotificationCount(
    showNotifications ? user?.uid : null,
  );

  const navigation = useStudentDashboardNavigation({
    routePrefix,
    hideViewAllRoutes,
  });
  const { listRoute } = navigation;

  const {
    visibleSchedule,
    currentScheduleId,
    homeworkSlides,
    visibleExams,
  } = useStudentDashboardDerivedData({
    schedule,
    homework,
    exams,
    gradedExamIds,
  });

  const firstName = (
    displayName?.split(" ")[0] || t("common.student")
  ).toUpperCase();
  const initials =
    displayName
      ?.split(" ")
      ?.map((n) => n[0])
      ?.join("")
      ?.toUpperCase() || "S";

  const todayKey = getTodayDayKey();
  const todayLabel = getWeekdayLabel(t, todayKey);
  const handleLogout = useDashboardLogout(logout);

  return (
    <View style={styles.mainContainer}>
      <DashboardHeader
        initials={initials}
        displayName={displayName}
        photoURL={photoURL}
        firstName={firstName}
        headerSubtitle={headerSubtitle}
        showNotifications={showNotifications}
        showHeaderLogout={showHeaderLogout}
        showHealthCheck={showHealthCheck}
        onHealthCheckPress={onHealthCheckPress}
        notificationRoute={`${routePrefix}/notifications`}
        notificationUnreadCount={notificationUnreadCount}
        onLogout={handleLogout}
        onMenuPress={onMenuPress}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <DashboardAnnouncementsSection
          messages={messages}
          classId={classId}
          useParentRoutes={useParentRoutes}
          navigation={navigation}
          listRoute={listRoute("/messages")}
        />

        <DashboardScheduleSection
          schedule={schedule}
          visibleSchedule={visibleSchedule}
          currentScheduleId={currentScheduleId}
          classId={classId}
          todayLabel={todayLabel}
        />

        <DashboardHomeworkSection
          homework={homework}
          homeworkSlides={homeworkSlides}
          classId={classId}
          useParentRoutes={useParentRoutes}
          navigation={navigation}
          listRoute={listRoute("/homeworks")}
        />

        <DashboardExamsSection
          exams={exams}
          visibleExams={visibleExams}
          classId={classId}
          useParentRoutes={useParentRoutes}
          navigation={navigation}
          listRoute={listRoute("/exams")}
        />

        <DashboardRemarksSection
          remarksAndAttendance={remarksAndAttendance}
          studentId={studentId}
          displayName={displayName}
          classId={classId}
          useParentRoutes={useParentRoutes}
          navigation={navigation}
          listRoute={listRoute("/attendance")}
        />

        {showAbsenceReport && parentId ? (
          <DashboardAbsenceReportSection
            parentId={parentId}
            studentId={studentId}
            classId={classId}
          />
        ) : null}

        <View style={styles.scrollBottomSpacer} />
      </ScrollView>
    </View>
  );
}
