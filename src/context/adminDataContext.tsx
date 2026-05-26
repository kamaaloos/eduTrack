import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useAdminClasses, type ClassData } from "../../hooks/useAdminClasses";
import { useAdminRelations } from "../../hooks/useAdminRelations";
import {
  useAdminUsers,
  type UserData,
  type UserRole,
} from "../../hooks/useAdminUsers";

type AdminDataContextValue = {
  students: UserData[];
  teachers: UserData[];
  parents: UserData[];
  classes: ClassData[];
  usersLoading: boolean;
  classesLoading: boolean;
  relationsLoading: boolean;
  loadUsers: () => Promise<void>;
  loadClasses: () => Promise<void>;
  createUser: (params: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }) => Promise<string>;
  createClass: (className: string) => Promise<string>;
  updateClassSubjects: (classId: string, subjects: string[]) => Promise<void>;
  syncClassIdsFromAssignments: () => Promise<{
    updated: number;
    message: string;
  }>;
  assignStudentToClass: (studentId: string, classId: string) => Promise<void>;
  assignTeacherToClass: (teacherId: string, classId: string) => Promise<void>;
  assignTeacherToSubject: (
    teacherId: string,
    classId: string,
    subject: string,
  ) => Promise<void>;
  loadTeacherSubjectAssignments: () => Promise<
    import("../../hooks/useAdminRelations").TeacherSubjectLink[]
  >;
  removeTeacherSubjectAssignment: (assignmentId: string) => Promise<void>;
  linkParentToStudent: (parentId: string, studentId: string) => Promise<void>;
  repairParentStudentLinks: () => Promise<string>;
  updateUser: (
    userId: string,
    updates: { name?: string; email?: string },
  ) => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  removeUser: (userId: string, role: UserRole) => Promise<void>;
  updateClass: (classId: string, name: string) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
  refreshAll: () => Promise<void>;
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const {
    students,
    teachers,
    parents,
    loading: usersLoading,
    loadUsers,
    createUser,
    updateUser,
    resetUserPassword,
    removeUser,
  } = useAdminUsers();

  const {
    classes,
    loading: classesLoading,
    loadClasses,
    createClass,
    updateClassSubjects,
    updateClass,
    deleteClass,
  } = useAdminClasses();

  const {
    loading: relationsLoading,
    syncClassIdsFromAssignments,
    assignStudentToClass,
    assignTeacherToClass,
    assignTeacherToSubject,
    loadTeacherSubjectAssignments,
    removeTeacherSubjectAssignment,
    linkParentToStudent,
    repairParentStudentLinks,
  } = useAdminRelations();

  const refreshAll = useCallback(async () => {
    await Promise.all([loadUsers(), loadClasses()]);
  }, [loadUsers, loadClasses]);

  const value = useMemo<AdminDataContextValue>(
    () => ({
      students,
      teachers,
      parents,
      classes,
      usersLoading,
      classesLoading,
      relationsLoading,
      loadUsers,
      loadClasses,
      createUser,
      createClass,
      updateClassSubjects,
      syncClassIdsFromAssignments,
      assignStudentToClass,
      assignTeacherToClass,
      assignTeacherToSubject,
      loadTeacherSubjectAssignments,
      removeTeacherSubjectAssignment,
      linkParentToStudent,
      repairParentStudentLinks,
      updateUser,
      resetUserPassword,
      removeUser,
      updateClass,
      deleteClass,
      refreshAll,
    }),
    [
      students,
      teachers,
      parents,
      classes,
      usersLoading,
      classesLoading,
      relationsLoading,
      loadUsers,
      loadClasses,
      createUser,
      createClass,
      updateClassSubjects,
      syncClassIdsFromAssignments,
      assignStudentToClass,
      assignTeacherToClass,
      assignTeacherToSubject,
      loadTeacherSubjectAssignments,
      removeTeacherSubjectAssignment,
      linkParentToStudent,
      repairParentStudentLinks,
      updateUser,
      resetUserPassword,
      removeUser,
      updateClass,
      deleteClass,
      refreshAll,
    ],
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData(): AdminDataContextValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error("useAdminData must be used within AdminDataProvider");
  }
  return ctx;
}
