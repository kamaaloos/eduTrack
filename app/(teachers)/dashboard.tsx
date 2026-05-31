import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { TeacherDashboardView } from "../../components/teachers/TeacherDashboardView";
import { useTeacherDashboardData } from "../../hooks/useTeacherDashboardData";
import { useTeacherPendingAbsenceCount } from "../../hooks/useTeacherPendingAbsenceCount";
import { useUnreadNotificationCount } from "../../hooks/useNotifications";
import { AuthContext } from "../../src/context/authContext";
import { useTeacherMenu } from "../../src/context/teacherMenuContext";
import { useTeacherClassesContext } from "../../src/context/teacherClassesContext";

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);
  const { openMenu } = useTeacherMenu();
  const { classes: teacherClasses, teacherId } = useTeacherClassesContext();
  const pendingAbsenceCount = useTeacherPendingAbsenceCount(
    teacherId,
    teacherClasses.map((c) => c.id),
  );
  const alertCount = useUnreadNotificationCount(user?.uid);

  const {
    classes,
    studentCount,
    announcements,
    selectedClassId,
    setSelectedClassId,
    classChipOptions,
    filteredStudents,
    selectedClassLabel,
    refreshing,
    onRefresh,
  } = useTeacherDashboardData();

  const firstName = userData?.name?.split(" ")[0] || t("common.teacher");

  return (
    <TeacherDashboardView
      displayName={userData?.name}
      photoURL={userData?.photoURL ?? null}
      firstName={firstName}
      alertCount={alertCount}
      pendingAbsenceCount={pendingAbsenceCount}
      classCount={classes.length}
      studentCount={studentCount}
      classChipOptions={classChipOptions}
      selectedClassId={selectedClassId}
      onSelectClass={setSelectedClassId}
      selectedClassLabel={selectedClassLabel}
      filteredStudents={filteredStudents}
      announcements={announcements}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onMenuPress={openMenu}
    />
  );
}
