import { useCallback, useEffect, useState } from "react";
import { useSchoolContext } from "../src/context/schoolContext";
import {
  dismissAnnouncement,
  loadDismissedContentKeys,
  type DismissedContentType,
} from "../src/services/dismissedContent";

export function useDismissedContent(userId: string | null | undefined) {
  const { selectedSchool } = useSchoolContext();
  const schoolKey = selectedSchool?.id ?? null;
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId || !schoolKey) {
      setDismissedKeys(new Set());
      return;
    }

    let active = true;
    void loadDismissedContentKeys(userId, schoolKey).then((keys) => {
      if (active) setDismissedKeys(keys);
    });

    return () => {
      active = false;
    };
  }, [userId, schoolKey]);

  const dismiss = useCallback(
    async (
      type: DismissedContentType,
      classId: string,
      itemId: string,
    ) => {
      if (!userId || !schoolKey) return;
      if (type === "announcement") {
        await dismissAnnouncement(userId, schoolKey, classId, itemId);
        const key = `${type}_${classId}_${itemId}`;
        setDismissedKeys((prev) => new Set([...prev, key]));
      }
    },
    [userId, schoolKey],
  );

  return { dismissedKeys, dismiss };
}
