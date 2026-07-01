import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { getSchoolTermRecord } from "../src/services/schoolTerm";
import type { SchoolTermRecord } from "../src/types/schoolTerm";
import { resolveSchoolTerm } from "../src/utils/schoolTerm";

export function useSchoolTerm() {
  const [term, setTerm] = useState<SchoolTermRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const record = await getSchoolTermRecord();
      setTerm(record);
    } catch (err) {
      console.warn("school term load:", err);
      setTerm(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const resolved = useMemo(() => resolveSchoolTerm(term), [term]);

  return { term: resolved, loading, reload: load };
}
