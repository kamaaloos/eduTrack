import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    where,
} from "firebase/firestore";
import { useCallback, useState } from "react";
import { db } from "../src/services/firebase";
import { normalizeSubjectKey, subjectsMatch } from "../src/utils/subjectKey";
import { syncParentClassAccess } from "../src/services/parentChildren";
import {
    reconcileParentStudentLinks,
    upsertParentStudentLink,
} from "../src/services/parentStudentLinks";

export interface StudentClassLink {
    studentId: string;
    classId: string;
    createdAt?: Date;
}

export type TeacherSubjectLink = {
    id: string;
    teacherId: string;
    classId: string;
    subject: string;
    subjectKey: string;
};

export const useAdminRelations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const assignStudentToClass = useCallback(
        async (studentId: string, classId: string): Promise<void> => {
            if (!studentId || !classId) {
                throw new Error("Student ID and Class ID are required");
            }

            setLoading(true);
            setError(null);

            try {
                const linkId = `${studentId}_${classId}`;
                await setDoc(
                    doc(db, "studentClasses", linkId),
                    {
                        studentId,
                        classId,
                        createdAt: new Date(),
                    },
                    { merge: true },
                );

                // Update user profile
                await setDoc(
                    doc(db, "users", studentId),
                    { classId },
                    { merge: true }
                );

                const parentLinks = await getDocs(
                    query(
                        collection(db, "parentStudents"),
                        where("studentId", "==", studentId),
                    ),
                );
                await Promise.all(
                    parentLinks.docs.map((d) => {
                        const parentId = d.data().parentId as string;
                        return syncParentClassAccess(parentId, studentId);
                    }),
                );
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to assign student to class";
                setError(message);
                throw new Error(message);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const assignTeacherToClass = useCallback(
        async (teacherId: string, classId: string): Promise<void> => {
            if (!teacherId || !classId) {
                throw new Error("Teacher ID and Class ID are required");
            }

            setLoading(true);
            setError(null);

            try {
                const docId = `${teacherId}_${classId}`;
                await setDoc(
                    doc(db, "teacherClasses", docId),
                    {
                        teacherId,
                        classId,
                        createdAt: new Date(),
                    },
                    { merge: true },
                );
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to assign teacher to class";
                setError(message);
                throw new Error(message);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const assignTeacherToSubject = useCallback(
        async (
            teacherId: string,
            classId: string,
            subject: string,
        ): Promise<void> => {
            const trimmed = subject.trim();
            if (!teacherId || !classId || !trimmed) {
                throw new Error("Teacher, class, and subject are required");
            }

            setLoading(true);
            setError(null);

            try {
                const classSnap = await getDoc(doc(db, "classes", classId));
                if (!classSnap.exists()) {
                    throw new Error("Class not found");
                }

                const classSubjects = (classSnap.data().subjects as string[]) || [];
                if (classSubjects.length === 0) {
                    throw new Error(
                        "Add subjects to this class first (e.g. Math, English).",
                    );
                }

                const known = classSubjects.find((s) => subjectsMatch(s, trimmed));
                if (!known) {
                    throw new Error(
                        `"${trimmed}" is not a subject for this class. Choose from: ${classSubjects.join(", ")}`,
                    );
                }

                const subjectKey = normalizeSubjectKey(known);
                const assignmentId = `${teacherId}_${classId}_${subjectKey}`;

                await setDoc(
                    doc(db, "teacherSubjects", assignmentId),
                    {
                        teacherId,
                        classId,
                        subject: known,
                        subjectKey,
                        createdAt: new Date(),
                    },
                    { merge: true },
                );

                await setDoc(
                    doc(db, "teacherClasses", `${teacherId}_${classId}`),
                    {
                        teacherId,
                        classId,
                        createdAt: new Date(),
                    },
                    { merge: true },
                );
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to assign teacher to subject";
                setError(message);
                throw new Error(message);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const loadTeacherSubjectAssignments = useCallback(async (): Promise<
        TeacherSubjectLink[]
    > => {
        const snap = await getDocs(collection(db, "teacherSubjects"));
        return snap.docs.map((d) => {
            const data = d.data();
            return {
                id: d.id,
                teacherId: data.teacherId as string,
                classId: data.classId as string,
                subject: data.subject as string,
                subjectKey:
                    (data.subjectKey as string) ||
                    normalizeSubjectKey(data.subject as string),
            };
        });
    }, []);

    const removeTeacherSubjectAssignment = useCallback(
        async (assignmentId: string): Promise<void> => {
            if (!assignmentId) return;

            setLoading(true);
            setError(null);
            try {
                await deleteDoc(doc(db, "teacherSubjects", assignmentId));
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to remove assignment";
                setError(message);
                throw new Error(message);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const linkParentToStudent = useCallback(
        async (parentId: string, studentId: string): Promise<void> => {
            if (!parentId || !studentId) {
                throw new Error("Parent ID and Student ID are required");
            }

            setLoading(true);
            setError(null);

            try {
                await upsertParentStudentLink(parentId, studentId);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to link parent to student";
                setError(message);
                throw new Error(message);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const syncClassIdsFromAssignments = useCallback(
        async (): Promise<{ updated: number; message: string }> => {
            setLoading(true);
            setError(null);

            try {
                const [linksSnap, usersSnapshot] = await Promise.all([
                    getDocs(collection(db, "studentClasses")),
                    getDocs(collection(db, "users")),
                ]);

                const usersData = usersSnapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    ...docSnap.data(),
                })) as any[];

                const usersById = new Map(usersData.map((u) => [u.id, u]));
                const latestByStudent = new Map<string, { classId: string; t: number }>();

                // Find latest class assignment for each student
                linksSnap.docs.forEach((d) => {
                    const data = d.data() as Record<string, unknown>;
                    const studentId = data.studentId as string | undefined;
                    const classId = data.classId as string | undefined;
                    if (!studentId || !classId) return;

                    const c = data.createdAt as
                        | { toMillis?: () => number; seconds?: number }
                        | undefined;
                    const t =
                        typeof c?.toMillis === "function"
                            ? c.toMillis()
                            : typeof c?.seconds === "number"
                                ? c.seconds * 1000
                                : 0;

                    const prev = latestByStudent.get(studentId);
                    if (!prev || t >= prev.t) {
                        latestByStudent.set(studentId, { classId, t });
                    }
                });

                // Find profiles that need updating
                const toWrite = [...latestByStudent.entries()].filter(
                    ([studentId, { classId }]) => {
                        const profile = usersById.get(studentId);
                        if (!profile) return false;
                        return profile.classId !== classId;
                    }
                );

                // Batch update
                if (toWrite.length > 0) {
                    await Promise.all(
                        toWrite.map(([studentId, { classId }]) =>
                            setDoc(
                                doc(db, "users", studentId),
                                { classId },
                                { merge: true }
                            )
                        )
                    );
                }

                const message =
                    toWrite.length === 0
                        ? "All student profiles already matched assignments."
                        : `Updated classId on ${toWrite.length} student profile(s).`;

                return { updated: toWrite.length, message };
            } catch (err) {
                const message = err instanceof Error ? err.message : "Sync failed";
                setError(message);
                throw new Error(message);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const repairParentStudentLinks = useCallback(async (): Promise<string> => {
        setLoading(true);
        setError(null);
        try {
            await reconcileParentStudentLinks();
            return "Parent–student links reconciled. Parents should now see all linked children.";
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Repair failed";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        assignStudentToClass,
        assignTeacherToClass,
        assignTeacherToSubject,
        loadTeacherSubjectAssignments,
        removeTeacherSubjectAssignment,
        linkParentToStudent,
        syncClassIdsFromAssignments,
        repairParentStudentLinks,
    };
};
