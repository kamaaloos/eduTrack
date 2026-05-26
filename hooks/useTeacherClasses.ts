import { useCallback, useContext, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useFocusEffect } from "expo-router";
import { AuthContext } from "../src/context/authContext";
import { useSchoolContext } from "../src/context/schoolContext";
import { db } from "../src/services/firebase";
import { isIgnorableFirestoreListenerError } from "../src/services/firestoreSession";
import type { TeacherClass } from "../src/services/teacherClasses";
import { useFirestoreListenerEffect } from "./useFirestoreListenerEffect";

async function resolveClassDocuments(classIds: string[]): Promise<TeacherClass[]> {
  if (!db || classIds.length === 0) return [];

  const classData = await Promise.all(
    classIds.map(async (id) => {
      try {
        const classSnap = await getDoc(doc(db, "classes", id));
        return {
          id: classSnap.exists() ? classSnap.id : id,
          name: (classSnap.data()?.name as string) || "Class",
          ...(classSnap.data() || {}),
        } as TeacherClass;
      } catch (err) {
        console.warn("Failed to load class document", id, err);
        return { id, name: "Class" } as TeacherClass;
      }
    }),
  );

  return classData;
}

export function useTeacherClasses() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { selectedSchool } = useSchoolContext();
  const schoolKey = selectedSchool?.id ?? null;

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const teacherId = user?.uid ?? null;

  useFirestoreListenerEffect(() => {
    if (authLoading) return;

    if (!teacherId || !db || !schoolKey) {
      setClasses([]);
      setSelectedClassId("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const classQuery = query(
      collection(db, "teacherClasses"),
      where("teacherId", "==", teacherId),
    );

    return onSnapshot(
      classQuery,
      async (snapshot) => {
        try {
          const ids = [
            ...new Set(
              snapshot.docs
                .map((d) => d.data().classId as string)
                .filter(Boolean),
            ),
          ];

          if (ids.length === 0) {
            setClasses([]);
            setSelectedClassId("");
            setLoading(false);
            return;
          }

          const loaded = await resolveClassDocuments(ids);
          setClasses(loaded);
          setSelectedClassId((prev) =>
            prev && loaded.some((c) => c.id === prev)
              ? prev
              : loaded[0]?.id ?? "",
          );
        } catch (err) {
          if (!isIgnorableFirestoreListenerError(err)) {
            console.error("useTeacherClasses snapshot:", err);
          }
          setError("Could not load your classes.");
          setClasses([]);
          setSelectedClassId("");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        if (isIgnorableFirestoreListenerError(err)) return;
        console.error("useTeacherClasses listener:", err);
        setError("Could not load your classes.");
        setClasses([]);
        setSelectedClassId("");
        setLoading(false);
      },
    );
  }, [authLoading, teacherId, schoolKey]);

  useFocusEffect(
    useCallback(() => {
      if (!teacherId || authLoading) return;
      setSelectedClassId((prev) => {
        if (prev && classes.some((c) => c.id === prev)) return prev;
        return classes[0]?.id ?? prev;
      });
    }, [teacherId, authLoading, classes]),
  );

  return {
    classes,
    selectedClassId,
    setSelectedClassId,
    loading: authLoading || loading,
    error,
    teacherId,
  };
}
