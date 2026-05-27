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
import {
  getSchoolRegistryEntry,
  loadActiveSchools,
} from "../services/schoolRegistry";
import {
  auth,
  connectToSchool,
  disconnectSchool,
} from "../services/firebase";
import type { SchoolRecord, StoredSchool } from "../types/school";
import {
  applyRegistryToStoredSchool,
  storedSchoolNeedsPersist,
  toStoredSchool,
} from "../utils/schoolSelection";
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
  refreshSelectedSchoolFromRegistry: () => Promise<StoredSchool | null>;
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

  const mergeStoredSchoolWithRegistry = useCallback(
    async (stored: StoredSchool): Promise<StoredSchool> => {
      const fresh = await getSchoolRegistryEntry(stored.id);
      const updated = applyRegistryToStoredSchool(stored, fresh);
      if (storedSchoolNeedsPersist(stored, updated)) {
        await saveSelectedSchool(updated);
      }
      return updated;
    },
    [],
  );

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

  const refreshSelectedSchoolFromRegistry =
    useCallback(async (): Promise<StoredSchool | null> => {
      if (!selectedSchool) return null;
      try {
        const updated = await mergeStoredSchoolWithRegistry(selectedSchool);
        if (
          updated.usageExpiresAt !== (selectedSchool.usageExpiresAt ?? null) ||
          updated.name !== selectedSchool.name
        ) {
          setSelectedSchool(updated);
        }
        return updated;
      } catch (err) {
        console.warn("refreshSelectedSchoolFromRegistry failed:", err);
        return selectedSchool;
      }
    }, [mergeStoredSchoolWithRegistry, selectedSchool]);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        await reloadSchools();
        const saved = await getSelectedSchool();
        if (!active) return;

        if (saved) {
          await connectToSchool(saved.firebase);
          const merged = await mergeStoredSchoolWithRegistry(saved);
          if (active) {
            setSelectedSchool(merged);
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
  }, [reloadSchools, mergeStoredSchoolWithRegistry]);

  useEffect(() => {
    if (!selectedSchool || schools.length === 0) return;
    const match = schools.find((school) => school.id === selectedSchool.id);
    if (!match) return;

    const nextExpiry = match.usageExpiresAt ?? null;
    const currentExpiry = selectedSchool.usageExpiresAt ?? null;
    if (match.name === selectedSchool.name && nextExpiry === currentExpiry) {
      return;
    }

    const updated: StoredSchool = {
      ...selectedSchool,
      name: match.name,
      usageExpiresAt: nextExpiry,
    };
    void saveSelectedSchool(updated).then(() => setSelectedSchool(updated));
  }, [schools, selectedSchool]);

  const selectSchool = useCallback(async (school: SchoolRecord) => {
    setConnecting(true);
    setError(null);
    try {
      await connectToSchool(school.firebase);
      const stored = toStoredSchool(school);
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
      refreshSelectedSchoolFromRegistry,
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
      refreshSelectedSchoolFromRegistry,
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
