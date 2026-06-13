import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { assertSchoolAdmin, parseRole } from "./schoolAdminAuth";

function ensureAdminApp() {
  if (getApps().length === 0) {
    initializeApp();
  }
}

function parsePassword(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const password = value.trim();
  if (password.length < 6) return null;
  return password;
}

/**
 * Callable: school admin sets a temporary password for a user (no email link).
 */
export const setSchoolUserPassword = onCall({ invoker: "public" }, async (request) => {
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

  ensureAdminApp();
  const db = getFirestore();
  await assertSchoolAdmin(db, request.auth.uid);

  const targetSnap = await db.collection("users").doc(userId).get();
  if (!targetSnap.exists) {
    throw new HttpsError("not-found", "User profile not found.");
  }

  const profileRole = parseRole(targetSnap.data()?.role);
  if (!profileRole || profileRole === "admin") {
    throw new HttpsError(
      "failed-precondition",
      "Only student, teacher, and parent passwords can be reset here.",
    );
  }

  try {
    await getAuth().updateUser(userId, { password: newPassword });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("setSchoolUserPassword: auth update failed", { userId, message });
    throw new HttpsError("internal", "Could not update password.");
  }

  await db.collection("users").doc(userId).set(
    {
      mustChangePassword: true,
      passwordResetAt: FieldValue.serverTimestamp(),
      passwordResetBy: request.auth.uid,
    },
    { merge: true },
  );

  logger.info("setSchoolUserPassword: complete", {
    userId,
    role: profileRole,
    adminUid: request.auth.uid,
  });

  return { ok: true };
});
