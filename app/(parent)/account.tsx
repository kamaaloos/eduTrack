import { ProfileScreen } from "../../components/profile/ProfileScreen";
import { ParentScreenShell } from "../../components/parent/ParentScreenShell";
import { useTranslation } from "react-i18next";

export default function ParentAccountScreen() {
  const { t } = useTranslation();

  return (
    <ParentScreenShell
      title={t("tabs.parent.profile")}
      showNotifications={false}
    >
      <ProfileScreen roleLabel="Parent" />
    </ParentScreenShell>
  );
}
