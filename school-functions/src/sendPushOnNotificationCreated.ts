import { logger } from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getSchoolAdminDb } from "./firebaseAdmin";

type NotificationDoc = {
  title?: string;
  message?: string;
  type?: string;
  targetUserId?: string;
  targetRole?: string;
  studentId?: string | null;
  classId?: string | null;
};

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  sound: "default";
  priority: "high";
  channelId: string;
  android?: {
    channelId: string;
    sound: "default";
    priority: "max";
  };
  ios?: {
    sound: "default";
  };
  data: Record<string, string>;
};

const PUSH_CHANNEL_ID = "edutrack-alerts";

async function sendExpoPush(message: ExpoPushMessage): Promise<void> {
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Expo push failed (${response.status}): ${text.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    data?: Array<{ status?: string; message?: string; details?: unknown }>;
  };

  const ticket = payload.data?.[0];
  if (ticket?.status === "error") {
    throw new Error(ticket.message ?? "Expo push ticket error");
  }
}

export const sendPushOnNotificationCreated = onDocumentCreated(
  "notifications/{notificationId}",
  async (event) => {
    const notificationId = event.params.notificationId;
    const data = event.data?.data() as NotificationDoc | undefined;

    if (!data?.targetUserId) {
      logger.debug("Push skipped: missing targetUserId", { notificationId });
      return;
    }

    const db = getSchoolAdminDb();

    const userSnap = await db.collection("users").doc(data.targetUserId).get();
    const pushToken = userSnap.data()?.expoPushToken as string | undefined;

    if (!pushToken || !pushToken.startsWith("ExponentPushToken[")) {
      logger.debug("Push skipped: no Expo token", {
        notificationId,
        targetUserId: data.targetUserId,
      });
      return;
    }

    const title = (data.title ?? "eduTrack").trim() || "eduTrack";
    const body = (data.message ?? "").trim() || title;

    try {
      await sendExpoPush({
        to: pushToken,
        title,
        body,
        sound: "default",
        priority: "high",
        channelId: PUSH_CHANNEL_ID,
        android: {
          channelId: PUSH_CHANNEL_ID,
          sound: "default",
          priority: "max",
        },
        ios: {
          sound: "default",
        },
        data: {
          notificationId,
          type: data.type ?? "announcement",
          targetRole: data.targetRole ?? "",
          studentId: data.studentId ?? "",
          classId: data.classId ?? "",
        },
      });

      logger.info("Push sent", {
        notificationId,
        targetUserId: data.targetUserId,
      });
    } catch (err) {
      logger.warn("Push send failed", {
        notificationId,
        targetUserId: data.targetUserId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },
);
