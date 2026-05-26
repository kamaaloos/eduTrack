import type { TeacherAttendanceRecord } from "../../../src/services/teacherAttendanceResponses";

export type TodayMap = Record<string, TeacherAttendanceRecord>;

export type StudentRow = {
  id: string;
  name?: string;
  email?: string;
  classId?: string;
};
