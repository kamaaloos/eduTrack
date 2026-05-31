import { router, useLocalSearchParams } from "expo-router";
import { useContext, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { StudentDashboardView } from "../../../components/dashboard/StudentDashboardView";
import { AuthContext } from "../../../src/context/authContext";
import { useParentChild } from "../../../src/context/parentChildContext";
import { useParentMenu } from "../../../src/context/parentMenuContext";
import { useUserPhotoURL } from "../../../hooks/useUserPhotoURL";
import { useStudentDashboardData } from "../../../hooks/useStudentDashboardData";
import { syncParentClassAccess } from "../../../src/services/parentChildren";

export default function ParentStudentDashboard() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { setSelectedChild } = useParentChild();
  const { openMenu } = useParentMenu();
  const { id, name, photoURL: photoURLParam, classId, className } =
    useLocalSearchParams<{
      id: string;
      name?: string;
      photoURL?: string;
      classId?: string;
      className?: string;
    }>();

  const studentId = String(id ?? "");
  const resolvedClassId = classId ? String(classId) : null;
  const displayName = name ? String(name) : t("common.student");
  const livePhotoURL = useUserPhotoURL(studentId);
  const photoURL =
    livePhotoURL ||
    (photoURLParam && String(photoURLParam).trim()
      ? String(photoURLParam)
      : null);

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
  } = useStudentDashboardData(studentId, resolvedClassId);

  useEffect(() => {
    if (!studentId) return;
    setSelectedChild({
      id: studentId,
      name: displayName,
      photoURL,
      classId: resolvedClassId || undefined,
      className: className ? String(className) : undefined,
    });
  }, [studentId, displayName, photoURL, resolvedClassId, className, setSelectedChild]);

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
      onMenuPress={openMenu}
      onHealthCheckPress={() =>
        router.push({
          pathname: "/(parent)/report-absence",
          params: {
            studentId,
            studentName: displayName,
            className: className ? String(className) : "",
            classId: resolvedClassId || liveClassId || "",
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
