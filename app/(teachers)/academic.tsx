import { TeacherAcademicView } from "../../components/teachers/TeacherAcademicView";
import { useTeacherAcademic } from "../../hooks/useTeacherAcademic";

export default function AcademicScreen() {
  const academic = useTeacherAcademic();
  return <TeacherAcademicView {...academic} />;
}
