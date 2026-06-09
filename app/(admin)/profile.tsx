import { useTranslation } from "react-i18next";
import { ProfileScreen } from "../../components/profile/ProfileScreen";
import { AdminScreenShell } from "../../components/admin/AdminScreenShell";

export default function AdminProfileScreen() {
  const { t } = useTranslation();

  return (
    <AdminScreenShell title={t("profile.title")} showBack>
      <ProfileScreen showBack inScreenShell />
    </AdminScreenShell>
  );
}
