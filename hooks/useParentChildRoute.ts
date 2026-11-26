import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParentChild } from "../src/context/parentChildContext";
import { useUserPhotoURL } from "./useUserPhotoURL";

/** Resolve the selected child from route params + parent context (for child tab screens). */
export function useParentChildRoute() {
  const { t } = useTranslation();
  const { selectedChild, setSelectedChild } = useParentChild();
  const { id, name, photoURL: photoURLParam, classId, className } =
    useLocalSearchParams<{
      id: string;
      name?: string;
      photoURL?: string;
      classId?: string;
      className?: string;
    }>();

  const studentId = String(id ?? selectedChild?.id ?? "");
  const resolvedClassId =
    (classId ? String(classId) : null) || selectedChild?.classId || null;
  const displayName =
    (name ? String(name) : null) ||
    selectedChild?.name ||
    t("common.student");
  const resolvedClassName =
    (className ? String(className) : null) || selectedChild?.className || null;

  const livePhotoURL = useUserPhotoURL(studentId || undefined);
  const photoURL =
    livePhotoURL ||
    (photoURLParam && String(photoURLParam).trim()
      ? String(photoURLParam)
      : null) ||
    selectedChild?.photoURL ||
    null;

  useEffect(() => {
    if (!studentId) return;
    setSelectedChild({
      id: studentId,
      name: displayName,
      photoURL,
      classId: resolvedClassId || undefined,
      className: resolvedClassName || undefined,
    });
  }, [
    studentId,
    displayName,
    photoURL,
    resolvedClassId,
    resolvedClassName,
    setSelectedChild,
  ]);

  return useMemo(
    () => ({
      studentId,
      classId: resolvedClassId,
      className: resolvedClassName,
      displayName,
      photoURL,
    }),
    [studentId, resolvedClassId, resolvedClassName, displayName, photoURL],
  );
}
