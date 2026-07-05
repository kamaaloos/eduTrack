import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { AdminScreenShell } from "../../../components/admin/AdminScreenShell";
import { ParentFeeDetailContent } from "../../../components/admin/ParentFeeDetailContent";
import { useAdminData } from "../../../src/context/adminDataContext";

export default function AdminParentDetailScreen() {
  const { t } = useTranslation();
  const { parentId: parentIdParam } = useLocalSearchParams<{ parentId: string }>();
  const parentId = String(parentIdParam ?? "");
  const { parents, loadUsers } = useAdminData();

  const parent = parents.find((item) => item.id === parentId);

  return (
    <AdminScreenShell
      title={parent?.name || t("admin.parentDetailTitle")}
      subtitle={t("admin.parentDetailSubtitle")}
      showBack
    >
      <ParentFeeDetailContent
        parentId={parentId}
        parents={parents}
        loadUsers={loadUsers}
      />
    </AdminScreenShell>
  );
}
