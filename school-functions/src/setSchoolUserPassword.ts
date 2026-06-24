import { FieldValue, type Firestore, type DocumentData } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { getSchoolAdminAuth, getSchoolAdminDb } from "./firebaseAdmin";
import { assertSchoolAdmin, parseRole, type SchoolUserRole } from "./schoolAdminAuth";

function parsePassword(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const password = value.trim();
  if (password.length < 6) return null;
  return password;
}

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function authErrorCode(err: unknown): string {
  if (!err || typeof err !== "object") return "";

  if ("code" in err) {
    const code = (err as { code: string | number }).code;
    if (typeof code === "string" && code.length > 0) {
      return code;
    }
  }

  if ("errorInfo" in err) {
    const info = (err as { errorInfo?: { code?: string } }).errorInfo;
    if (info?.code) return info.code;
  }

  return "";
}

function mapAuthError(err: unknown): HttpsError {
  const code = authErrorCode(err);
  const message = err instanceof Error ? err.message : String(err);
  logger.warn("setSchoolUserPassword: auth error", { code, message });

  if (
    message.includes("PERMISSION_DENIED") ||
    message.includes("insufficient permission") ||
    code === "auth/insufficient-permission"
  ) {
    return new HttpsError(
      "failed-precondition",
      "School Cloud Functions cannot manage Authentication. In Google Cloud IAM, grant the functions service account the Firebase Authentication Admin role for this school project.",
    );
  }

  switch (code) {
    case "auth/user-not-found":
      return new HttpsError(
        "not-found",
        "This user has no login account. Add an email to their profile and try again.",
      );
    case "auth/email-already-exists":
      return new HttpsError(
        "failed-precondition",
        "That email is already linked to a different login. The password was not changed.",
      );
    case "auth/invalid-password":
      return new HttpsError(
        "invalid-argument",
        "Password does not meet Firebase requirements. Try a longer password.",
      );
    case "auth/invalid-email":
      return new HttpsError(
        "invalid-argument",
        "Profile email is not valid for login.",
      );
    case "auth/uid-already-exists":
      return new HttpsError(
        "failed-precondition",
        "Login account already exists. Try again.",
      );
    default:
      return new HttpsError(
        "failed-precondition",
        "Could not update password in Firebase Authentication. Check the user's email and Auth account in Firebase Console.",
      );
  }
}

async function updateAuthPassword(
  auth: Auth,
  uid: string,
  password: string,
): Promise<void> {
  await auth.updateUser(uid, { password });
}

/**
 * Sets password on the Auth account for this school user.
 * Handles Firestore UID ≠ Auth UID by looking up the profile email.
 */
async function setOrCreateAuthPassword(
  auth: Auth,
  userId: string,
  profileEmail: unknown,
  password: string,
): Promise<{ authUid: string; uidMismatch: boolean }> {
  const email = normalizeEmail(profileEmail);

  try {
    await updateAuthPassword(auth, userId, password);
    return { authUid: userId, uidMismatch: false };
  } catch (err) {
    if (authErrorCode(err) !== "auth/user-not-found") {
      throw mapAuthError(err);
    }
  }

  if (!email) {
    throw new HttpsError(
      "failed-precondition",
      "This user has no login account and no email on file. Add an email to their profile, then set a password again.",
    );
  }

  try {
    const byEmail = await auth.getUserByEmail(email);
    await updateAuthPassword(auth, byEmail.uid, password);
    const uidMismatch = byEmail.uid !== userId;
    if (uidMismatch) {
      logger.warn("setSchoolUserPassword: auth uid mismatch; password set on email account", {
        profileUserId: userId,
        authUid: byEmail.uid,
        email,
      });
    }
    return { authUid: byEmail.uid, uidMismatch };
  } catch (err) {
    if (authErrorCode(err) !== "auth/user-not-found") {
      throw mapAuthError(err);
    }
  }

  try {
    await auth.createUser({ uid: userId, email, password });
    return { authUid: userId, uidMismatch: false };
  } catch (err) {
    if (authErrorCode(err) === "auth/email-already-exists") {
      try {
        const byEmail = await auth.getUserByEmail(email);
        await updateAuthPassword(auth, byEmail.uid, password);
        return { authUid: byEmail.uid, uidMismatch: byEmail.uid !== userId };
      } catch (retryErr) {
        throw mapAuthError(retryErr);
      }
    }
    throw mapAuthError(err);
  }
}

async function repointLinks(
  db: Firestore,
  collectionName: string,
  field: string,
  fromId: string,
  toId: string,
  buildDocId?: (oldDocId: string, data: DocumentData) => string,
): Promise<void> {
  const snap = await db.collection(collectionName).where(field, "==", fromId).get();
  if (snap.empty) return;

  const batch = db.batch();
  for (const linkDoc of snap.docs) {
    const data = linkDoc.data();
    const newData = { ...data, [field]: toId };
    const newDocId = buildDocId ? buildDocId(linkDoc.id, data) : linkDoc.id.replace(fromId, toId);
    batch.set(db.collection(collectionName).doc(newDocId), newData, { merge: true });
    if (newDocId !== linkDoc.id) {
      batch.delete(linkDoc.ref);
    }
  }
  await batch.commit();
}

async function migrateFirestoreUserId(
  db: Firestore,
  fromId: string,
  toId: string,
  role: SchoolUserRole,
  profile: DocumentData,
): Promise<void> {
  await db.collection("users").doc(toId).set(
    {
      ...profile,
      email: normalizeEmail(profile.email),
    },
    { merge: true },
  );

  if (role === "parent") {
    await repointLinks(db, "parentStudents", "parentId", fromId, toId, (_oldId, data) => {
      const studentId = String(data.studentId ?? "");
      return `${toId}_${studentId}`;
    });
    await repointLinks(db, "parentClassAccess", "parentId", fromId, toId);
  } else if (role === "student") {
    await repointLinks(db, "studentClasses", "studentId", fromId, toId, (oldId) =>
      oldId.replace(fromId, toId),
    );
    await repointLinks(db, "attendance", "studentId", fromId, toId);
    await repointLinks(db, "grades", "studentId", fromId, toId);
    await repointLinks(db, "examResults", "studentId", fromId, toId);
  } else if (role === "teacher") {
    await repointLinks(db, "teacherClasses", "teacherId", fromId, toId, (oldId) =>
      oldId.replace(fromId, toId),
    );
    await repointLinks(db, "teacherSubjects", "teacherId", fromId, toId, (oldId) =>
      oldId.replace(fromId, toId),
    );
  }

  await db.collection("users").doc(fromId).delete();
}

/**
 * Callable: school admin sets a temporary password for a user (no email link).
 */
export const setSchoolUserPassword = onCall(
  { region: "us-central1", invoker: "public" },
  async (request) => {
    try {
      if (!request.auth?.uid) {
        throw new HttpsError("unauthenticated", "Sign in required.");
      }

      const userId =
        typeof request.data?.userId === "string" ? request.data.userId.trim() : "";
      const newPassword = parsePassword(request.data?.newPassword);

      if (!userId) {
        throw new HttpsError("invalid-argument", "userId is required.");
      }
      if (!newPassword) {
        throw new HttpsError(
          "invalid-argument",
          "Password must be at least 6 characters.",
        );
      }

      if (userId === request.auth.uid) {
        throw new HttpsError(
          "failed-precondition",
          "Use change password in your profile to update your own password.",
        );
      }

      const db = getSchoolAdminDb();
      const auth = getSchoolAdminAuth();

      try {
        await assertSchoolAdmin(db, request.auth.uid);
      } catch (err) {
        if (err instanceof HttpsError) throw err;
        logger.error("setSchoolUserPassword: admin check failed", { err });
        throw new HttpsError(
          "failed-precondition",
          "Could not verify school admin access.",
        );
      }

      let targetSnap;
      try {
        targetSnap = await db.collection("users").doc(userId).get();
      } catch (err) {
        logger.error("setSchoolUserPassword: profile read failed", { userId, err });
        throw new HttpsError(
          "failed-precondition",
          "Could not read the user profile from Firestore.",
        );
      }

      if (!targetSnap.exists) {
        throw new HttpsError("not-found", "User profile not found.");
      }

      const profile = targetSnap.data();
      const profileRole = parseRole(profile?.role);
      if (!profileRole || profileRole === "admin") {
        throw new HttpsError(
          "failed-precondition",
          "Only student, teacher, and parent passwords can be reset here.",
        );
      }

      let authResult: { authUid: string; uidMismatch: boolean };
      try {
        authResult = await setOrCreateAuthPassword(
          auth,
          userId,
          profile?.email,
          newPassword,
        );
      } catch (err) {
        if (err instanceof HttpsError) throw err;
        logger.error("setSchoolUserPassword: unexpected auth failure", {
          userId,
          err,
        });
        throw new HttpsError(
          "failed-precondition",
          "Could not update password in Firebase Authentication.",
        );
      }

      const profilePatch: Record<string, unknown> = {
        mustChangePassword: true,
        passwordResetAt: FieldValue.serverTimestamp(),
        passwordResetBy: request.auth.uid,
      };

      if (authResult.uidMismatch) {
        try {
          await migrateFirestoreUserId(
            db,
            userId,
            authResult.authUid,
            profileRole,
            profile ?? {},
          );
        } catch (err) {
          logger.error("setSchoolUserPassword: uid migration failed", {
            userId,
            authUid: authResult.authUid,
            err,
          });
          throw new HttpsError(
            "failed-precondition",
            "Password was updated but the user profile could not be aligned with Authentication. Check Firebase logs.",
          );
        }
        profilePatch.authUid = authResult.authUid;
        await db.collection("users").doc(authResult.authUid).set(profilePatch, { merge: true });
      } else {
        try {
          await db.collection("users").doc(userId).set(profilePatch, { merge: true });
        } catch (err) {
          logger.error("setSchoolUserPassword: profile update failed", { userId, err });
          throw new HttpsError(
            "failed-precondition",
            "Password was updated but the user profile could not be saved. Try again.",
          );
        }
      }

      logger.info("setSchoolUserPassword: complete", {
        userId,
        authUid: authResult.authUid,
        uidMismatch: authResult.uidMismatch,
        role: profileRole,
        adminUid: request.auth.uid,
      });

      return { ok: true, authUid: authResult.authUid, uidMismatch: authResult.uidMismatch };
    } catch (err) {
      if (err instanceof HttpsError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      const code = authErrorCode(err);
      logger.error("setSchoolUserPassword: unhandled failure", { message, code, err });
      throw new HttpsError(
        "failed-precondition",
        "Could not set password. Check Firebase Functions logs for this school project.",
      );
    }
  },
);
