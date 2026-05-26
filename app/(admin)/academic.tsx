import { AdminAcademicView } from "../../components/admin/AdminAcademicView";
import { useAdminAcademic } from "../../hooks/useAdminAcademic";

export default function AcademicPanel() {
  const academic = useAdminAcademic();
  return <AdminAcademicView {...academic} />;
}
