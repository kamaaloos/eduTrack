import { useTranslation } from "react-i18next";
import { ProfileScreen } from "../../components/profile/ProfileScreen";
import { TeacherScreenShell } from "../../components/teachers/TeacherScreenShell";

export default function TeacherProfileScreen() {
  const { t } = useTranslation();

  return (
    <TeacherScreenShell title={t("tabs.teacher.profile")} scroll={false}>
      <ProfileScreen roleLabel="Teacher" inScreenShell />
    </TeacherScreenShell>
  );
}
