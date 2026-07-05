import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ParentFeeDetailContent } from "../../../components/admin/ParentFeeDetailContent";
import { SecretaryScreenShell } from "../../../components/secretary/SecretaryScreenShell";
import { useSecretaryData } from "../../../src/context/secretaryDataContext";

export default function SecretaryParentDetailScreen() {
  const { t } = useTranslation();
  const { parentId: parentIdParam } = useLocalSearchParams<{ parentId: string }>();
  const parentId = String(parentIdParam ?? "");
  const { parents, loadUsers } = useSecretaryData();

  const parent = parents.find((item) => item.id === parentId);

  return (
    <SecretaryScreenShell
      title={parent?.name || t("admin.parentDetailTitle")}
      subtitle={t("admin.parentDetailSubtitle")}
      showBack
    >
      <ParentFeeDetailContent
        parentId={parentId}
        parents={parents}
        loadUsers={loadUsers}
        syncClassAccess={false}
      />
    </SecretaryScreenShell>
  );
}
