import { TeacherExamReportsView } from "../../components/teachers/TeacherExamReportsView";
import { useTeacherExamReports } from "../../hooks/useTeacherExamReports";

export default function TeacherExamReportsScreen() {
  const examReports = useTeacherExamReports();
  return <TeacherExamReportsView {...examReports} />;
}
