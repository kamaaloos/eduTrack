import {
    createUserWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { useCallback, useState } from "react";
import {
    removeUserAndLinks,
    sendUserPasswordReset,
    updateUserProfile,
} from "../src/services/adminUserManagement";
import { db, ensureAdminCreateAuth } from "../src/services/firebase";

export type UserRole = "student" | "teacher" | "parent" | "admin";

export interface UserData {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    classId?: string;
    [key: string]: any;
}

interface CreateUserParams {
    email: string;
    password: string;
    name: string;
    role: UserRole;
}

export const useAdminUsers = () => {
    const [students, setStudents] = useState<UserData[]>([]);
    const [teachers, setTeachers] = useState<UserData[]>([]);
    const [parents, setParents] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersData = usersSnapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
            })) as UserData[];

            setStudents(usersData.filter((u) => u.role === "student"));
            setTeachers(usersData.filter((u) => u.role === "teacher"));
            setParents(usersData.filter((u) => u.role === "parent"));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load users";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createUser = useCallback(
        async (params: CreateUserParams): Promise<string> => {
            const { email, password, name, role } = params;

            if (!email || !password || !name) {
                throw new Error("Email, password, and name are required");
            }

            if (password.length < 6) {
                throw new Error("Password must be at least 6 characters");
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                throw new Error("Invalid email format");
            }

            setLoading(true);
            setError(null);

            try {
                const secondaryAuth = ensureAdminCreateAuth();
                if (!secondaryAuth) {
                    throw new Error("School connection is not ready");
                }

                // Use secondary auth so the admin session stays signed in
                const userCred = await createUserWithEmailAndPassword(
                    secondaryAuth,
                    email,
                    password,
                );

                await setDoc(doc(db, "users", userCred.user.uid), {
                    name,
                    email,
                    role,
                    mustChangePassword: true,
                    createdAt: new Date(),
                });

                await signOut(secondaryAuth).catch(() => {});

                await loadUsers();

                return userCred.user.uid;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to create user";
                setError(message);
                throw new Error(message);
            } finally {
                setLoading(false);
            }
        },
        [loadUsers]
    );

    const updateUser = useCallback(
        async (
            userId: string,
            updates: { name?: string; email?: string },
        ): Promise<void> => {
            setLoading(true);
            setError(null);
            try {
                await updateUserProfile(userId, updates);
                await loadUsers();
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to update user";
                setError(message);
                throw new Error(message);
            } finally {
                setLoading(false);
            }
        },
        [loadUsers],
    );

    const resetUserPassword = useCallback(async (email: string): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            await sendUserPasswordReset(email);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to send reset email";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const removeUser = useCallback(
        async (userId: string, role: UserRole): Promise<void> => {
            setLoading(true);
            setError(null);
            try {
                await removeUserAndLinks(userId, role);
                await loadUsers();
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to remove user";
                setError(message);
                throw new Error(message);
            } finally {
                setLoading(false);
            }
        },
        [loadUsers],
    );

    return {
        students,
        teachers,
        parents,
        loading,
        error,
        loadUsers,
        createUser,
        updateUser,
        resetUserPassword,
        removeUser,
    };
};
