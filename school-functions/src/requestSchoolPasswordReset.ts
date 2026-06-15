import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { parseRole } from "./schoolAdminAuth";

function ensureAdminApp() {
  if (getApps().length === 0) {
    initializeApp();
  }
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

async function notifySchoolAdmins(params: {
  title: string;
  message: string;
  requesterUserId: string;
  requesterRole: string;
}): Promise<void> {
  const db = getFirestore();
  const admins = await db.collection("users").where("role", "==", "admin").get();
  if (admins.empty) return;

  const batch = db.batch();
  const now = new Date();

  for (const adminDoc of admins.docs) {
    const ref = db.collection("notifications").doc();
    batch.set(ref, {
      title: params.title,
      message: params.message,
      type: "password_reset_request",
      targetRole: "admin",
      targetUserId: adminDoc.id,
      studentId: null,
      classId: null,
      actorId: params.requesterUserId,
      actorRole: params.requesterRole,
      read: false,
      createdAt: now,
    });
  }

  await batch.commit();
}

/**
 * Callable: signed-out user asks for admin help (no email reset link is sent).
 */
export const requestSchoolPasswordReset = onCall(
  { invoker: "public" },
  async (request) => {
    const email = normalizeEmail(request.data?.email);
    if (!email) {
      throw new HttpsError("invalid-argument", "A valid email is required.");
    }

    ensureAdminApp();
    const db = getFirestore();

    const matches = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!matches.empty) {
      const userDoc = matches.docs[0];
      const data = userDoc.data();
      const role = parseRole(data.role);

      if (role && role !== "admin") {
        const name = typeof data.name === "string" ? data.name.trim() : email;
        try {
          await notifySchoolAdmins({
            title: "Password reset requested",
            message: `${name} (${email}) asked for a new password. Set a temporary password in User management and share it securely.`,
            requesterUserId: userDoc.id,
            requesterRole: role,
          });
          logger.info("requestSchoolPasswordReset: admins notified", {
            userId: userDoc.id,
            role,
          });
        } catch (err) {
          logger.warn("requestSchoolPasswordReset: notify failed", {
            email,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    return { ok: true };
  },
);
