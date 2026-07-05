import { collection, getDocs, query, where } from "firebase/firestore";
import { useCallback, useState } from "react";
import type { UserData } from "./useAdminUsers";
import { requireSchoolDb } from "../src/services/firebase";

export function useSecretaryParents() {
  const [parents, setParents] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadParents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(
        query(
          collection(requireSchoolDb(), "users"),
          where("role", "==", "parent"),
        ),
      );
      const parentsData = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as UserData[];
      parentsData.sort((a, b) =>
        (a.name || a.email || "").localeCompare(b.name || b.email || ""),
      );
      setParents(parentsData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load parents";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { parents, loading, error, loadParents };
}
