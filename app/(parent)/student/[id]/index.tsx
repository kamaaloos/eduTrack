import { router } from "expo-router";
import { useContext, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { StudentDashboardView } from "../../../../components/dashboard/StudentDashboardView";
import { useParentChildRoute } from "../../../../hooks/useParentChildRoute";
import { useStudentDashboardData } from "../../../../hooks/useStudentDashboardData";
import { AuthContext } from "../../../../src/context/authContext";
import { useParentMenu } from "../../../../src/context/parentMenuContext";
import { FLOATING_TAB_BAR_INSET } from "../../../../src/constants/tabBar";
import { syncParentClassAccess } from "../../../../src/services/parentChildren";

export default function ParentChildHomeScreen() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { openMenu } = useParentMenu();
  const { studentId, classId, className, displayName, photoURL } =
    useParentChildRoute();

  const {
    classId: liveClassId,
    messages,
    homework,
    exams,
    schedule,
    remarksAndAttendance,
    gradedExamIds,
    refreshing,
    onRefresh,
  } = useStudentDashboardData(
    studentId,
    classId,
    user?.uid
      ? { userId: user.uid, role: "parent", studentId }
      : undefined,
  );

  useEffect(() => {
    if (user?.uid && studentId) {
      void syncParentClassAccess(user.uid, studentId);
    }
  }, [user?.uid, studentId]);

  if (!studentId) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  return (
    <StudentDashboardView
      studentId={studentId}
      classId={liveClassId}
      displayName={displayName}
      photoURL={photoURL}
      showNotifications={false}
      hideViewAllRoutes
      useParentRoutes
      showAbsenceReport={false}
      showHealthCheck
      contentBottomInset={FLOATING_TAB_BAR_INSET}
      onMenuPress={openMenu}
      onHealthCheckPress={() =>
        router.push({
          pathname: "/(parent)/report-absence",
          params: {
            studentId,
            studentName: displayName,
            className: className ?? "",
            classId: classId || liveClassId || "",
          },
        })
      }
      parentId={user?.uid}
      headerSubtitle={
        className
          ? `${t("common.class")}: ${className}`
          : liveClassId
            ? `${t("common.class")}: ${liveClassId}`
            : t("parent.studentDetail")
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
      messages={messages}
      homework={homework}
      exams={exams}
      schedule={schedule}
      remarksAndAttendance={remarksAndAttendance}
      gradedExamIds={gradedExamIds}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
