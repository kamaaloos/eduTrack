import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ProfileScreen } from "../../components/profile/ProfileScreen";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";

export default function StudentAccountScreen() {
  const { t } = useTranslation();

  return (
    <StudentScreenShell title={t("tabs.student.profile")} showMenu scroll={false}>
      <ProfileScreen roleLabel="Student" inScreenShell />
    </StudentScreenShell>
  );
}
