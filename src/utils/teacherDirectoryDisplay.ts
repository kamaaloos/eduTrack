import type { TeacherSubjectLink } from "../../hooks/useAdminRelations";

export type TeacherClassLink = {
  teacherId: string;
  classId: string;
};

function resolveClassName(
  classId: string,
  classNameById: Record<string, string>,
): string {
  return classNameById[classId] || classId;
}

export function formatTeacherClassAssigned(
  teacherId: string,
  subjectLinks: TeacherSubjectLink[],
  classLinks: TeacherClassLink[],
  classNameById: Record<string, string>,
): string {
  const classIds = new Set<string>();

  for (const link of subjectLinks) {
    if (link.teacherId === teacherId && link.classId) {
      classIds.add(link.classId);
    }
  }

  for (const link of classLinks) {
    if (link.teacherId === teacherId && link.classId) {
      classIds.add(link.classId);
    }
  }

  if (classIds.size === 0) {
    return "—";
  }

  return [...classIds]
    .map((id) => resolveClassName(id, classNameById))
    .sort((a, b) => a.localeCompare(b))
    .join(", ");
}

export function formatTeacherSubjects(
  teacherId: string,
  subjectLinks: TeacherSubjectLink[],
): string {
  const subjects = new Set<string>();

  for (const link of subjectLinks) {
    if (link.teacherId === teacherId && link.subject?.trim()) {
      subjects.add(link.subject.trim());
    }
  }

  if (subjects.size === 0) {
    return "—";
  }

  return [...subjects].sort((a, b) => a.localeCompare(b)).join(", ");
}
