import { useTranslation } from "react-i18next";
import { ProfileScreen } from "../../components/profile/ProfileScreen";
import { ParentScreenShell } from "../../components/parent/ParentScreenShell";

export default function ParentAccountScreen() {
  const { t } = useTranslation();

  return (
    <ParentScreenShell
      title={t("tabs.parent.profile")}
      showNotifications={false}
      scroll={false}
    >
      <ProfileScreen roleLabel="Parent" inScreenShell />
    </ParentScreenShell>
  );
}
