import { createContext, useContext, type ReactNode } from "react";
import { useTeacherClasses } from "../../hooks/useTeacherClasses";
import type { TeacherClass } from "../services/teacherClasses";

type TeacherClassesContextValue = {
  classes: TeacherClass[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  loading: boolean;
  error: string | null;
  teacherId: string | null;
};

const TeacherClassesContext = createContext<TeacherClassesContextValue | null>(
  null,
);

export function TeacherClassesProvider({ children }: { children: ReactNode }) {
  const value = useTeacherClasses();
  return (
    <TeacherClassesContext.Provider value={value}>
      {children}
    </TeacherClassesContext.Provider>
  );
}

export function useTeacherClassesContext() {
  const ctx = useContext(TeacherClassesContext);
  if (!ctx) {
    throw new Error("useTeacherClassesContext must be used within TeacherClassesProvider");
  }
  return ctx;
}
