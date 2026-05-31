import { useContext } from "react";
import { AuthContext } from "../../src/context/authContext";
import { StudentDashboardView } from "../../components/dashboard/StudentDashboardView";
import { useStudentDashboardData } from "../../hooks/useStudentDashboardData";
import { useStudentMenu } from "../../src/context/studentMenuContext";

export default function StudentDashboard() {
  const { user, userData } = useContext(AuthContext);
  const { openMenu } = useStudentMenu();

  const {
    classId,
    messages,
    homework,
    exams,
    schedule,
    remarksAndAttendance,
    gradedExamIds,
    refreshing,
    onRefresh,
  } = useStudentDashboardData(user?.uid, userData?.classId);

  return (
    <StudentDashboardView
      studentId={user?.uid ?? ""}
      classId={classId}
      displayName={userData?.name || "Student"}
      photoURL={userData?.photoURL ?? null}
      routePrefix="/(students)"
      showNotifications
      showHeaderLogout={false}
      onMenuPress={openMenu}
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
