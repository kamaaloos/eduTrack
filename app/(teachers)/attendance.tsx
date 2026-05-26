import { TeacherAttendanceView } from "../../components/teachers/TeacherAttendanceView";
import { useTeacherAttendance } from "../../hooks/useTeacherAttendance";

export default function TeacherAttendanceScreen() {
  const attendance = useTeacherAttendance();
  return <TeacherAttendanceView {...attendance} />;
}
