import { addDoc, collection, doc, getDocs, setDoc } from "firebase/firestore";
import { useCallback, useState } from "react";
import {
    removeClass,
    updateClassRecord,
} from "../src/services/adminUserManagement";
import { db } from "../src/services/firebase";

export interface ClassData {
    id: string;
    name: string;
    subjects?: string[];
    createdAt?: Date;
    [key: string]: unknown;
}

export const useAdminClasses = () => {
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadClasses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const classesSnapshot = await getDocs(collection(db, "classes"));
            const classesData = classesSnapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
            })) as ClassData[];

            setClasses(classesData);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load classes";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createClass = useCallback(
        async (className: string): Promise<string> => {
            if (!className || !className.trim()) {
                throw new Error("Class name is required");
            }

            setLoading(true);
            setError(null);

            try {
                const docRef = await addDoc(collection(db, "classes"), {
                    name: className.trim(),
                    subjects: [],
                    createdAt: new Date(),
                });

                // Reload classes to reflect changes
                await loadClasses();

                return docRef.id;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to create class";
                setError(message);
                throw new Error(message);
            } finally {
                setLoading(false);
            }
        },
        [loadClasses]
    );

    const updateClassSubjects = useCallback(
        async (classId: string, subjects: string[]): Promise<void> => {
            if (!classId) throw new Error("Class is required");

            const cleaned = [
                ...new Set(
                    subjects.map((s) => s.trim()).filter((s) => s.length > 0),
                ),
            ];

            setLoading(true);
            setError(null);
            try {
                await setDoc(
                    doc(db, "classes", classId),
                    { subjects: cleaned },
                    { merge: true },
                );
                await loadClasses();
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to update class subjects";
                setError(message);
                throw new Error(message);
            } finally {
                setLoading(false);
            }
        },
        [loadClasses],
    );

    const updateClass = useCallback(
        async (classId: string, name: string): Promise<void> => {
            setLoading(true);
            setError(null);
            try {
                await updateClassRecord(classId, { name });
                await loadClasses();
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to update class";
                setError(message);
                throw new Error(message);
            } finally {
                setLoading(false);
            }
        },
        [loadClasses],
    );

    const deleteClass = useCallback(
        async (classId: string): Promise<void> => {
            setLoading(true);
            setError(null);
            try {
                await removeClass(classId);
                await loadClasses();
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to delete class";
                setError(message);
                throw new Error(message);
            } finally {
                setLoading(false);
            }
        },
        [loadClasses],
    );

    return {
        classes,
        loading,
        error,
        loadClasses,
        createClass,
        updateClassSubjects,
        updateClass,
        deleteClass,
    };
};
