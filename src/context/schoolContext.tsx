import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { signOut } from "firebase/auth";
import { loadActiveSchools } from "../services/schoolRegistry";
import {
  auth,
  connectToSchool,
  disconnectSchool,
} from "../services/firebase";
import type { SchoolRecord, StoredSchool } from "../types/school";
import {
  clearSelectedSchool,
  getSelectedSchool,
  saveSelectedSchool,
} from "../utils/schoolStorage";

type SchoolContextValue = {
  selectedSchool: StoredSchool | null;
  schools: SchoolRecord[];
  schoolReady: boolean;
  schoolsLoading: boolean;
  connecting: boolean;
  error: string | null;
  selectSchool: (school: SchoolRecord) => Promise<void>;
  clearSchool: () => Promise<void>;
  resetSchoolSession: () => Promise<void>;
  reloadSchools: () => Promise<void>;
};

export const SchoolContext = createContext<SchoolContextValue | null>(null);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [selectedSchool, setSelectedSchool] = useState<StoredSchool | null>(
    null,
  );
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [schoolReady, setSchoolReady] = useState(false);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadSchools = useCallback(async () => {
    setSchoolsLoading(true);
    setError(null);
    try {
      const list = await loadActiveSchools();
      setSchools(list);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load schools";
      setError(message);
      setSchools([]);
    } finally {
      setSchoolsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        await reloadSchools();
        const saved = await getSelectedSchool();
        if (!active) return;

        if (saved) {
          await connectToSchool(saved.firebase);
          if (active) {
            setSelectedSchool(saved);
          }
        }
      } catch (err) {
        if (active) {
          const message =
            err instanceof Error ? err.message : "Failed to connect to school";
          setError(message);
        }
      } finally {
        if (active) {
          setSchoolReady(true);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [reloadSchools]);

  const selectSchool = useCallback(async (school: SchoolRecord) => {
    setConnecting(true);
    setError(null);
    try {
      await connectToSchool(school.firebase);
      const stored: StoredSchool = {
        id: school.id,
        name: school.name,
        firebase: school.firebase,
      };
      await saveSelectedSchool(stored);
      setSelectedSchool(stored);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect to school";
      setError(message);
      throw new Error(message);
    } finally {
      setConnecting(false);
    }
  }, []);

  const clearSchool = useCallback(async () => {
    setError(null);
    try {
      if (auth?.currentUser) {
        await signOut(auth);
      }
      await disconnectSchool();
      await clearSelectedSchool();
      setSelectedSchool(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to change school";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const resetSchoolSession = useCallback(async () => {
    setError(null);
    await disconnectSchool();
    await clearSelectedSchool();
    setSelectedSchool(null);
  }, []);

  const value = useMemo(
    () => ({
      selectedSchool,
      schools,
      schoolReady,
      schoolsLoading,
      connecting,
      error,
      selectSchool,
      clearSchool,
      resetSchoolSession,
      reloadSchools,
    }),
    [
      selectedSchool,
      schools,
      schoolReady,
      schoolsLoading,
      connecting,
      error,
      selectSchool,
      clearSchool,
      resetSchoolSession,
      reloadSchools,
    ],
  );

  return (
    <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>
  );
}

export function useSchoolContext() {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error("useSchoolContext must be used within SchoolProvider");
  }
  return context;
}
