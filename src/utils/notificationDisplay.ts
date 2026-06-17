import {
  NOTIFICATION_TYPE_LABELS,
  type AppNotification,
  type NotificationType,
} from "../services/notifications";

export type NotificationTranslate = (
  key: string,
  params?: Record<string, string>,
) => string;

function parseComplaintParams(item: AppNotification): {
  parentName?: string;
  subject?: string;
} {
  const fromStore = item.localeParams ?? {};
  const parentName =
    fromStore.parentName ||
    extractParentComplaintParentName(item.message) ||
    undefined;
  const subject =
    fromStore.subject ||
    extractComplaintSubject(item.message) ||
    undefined;
  return { parentName, subject };
}

function extractComplaintSubject(message: string): string | null {
  const match = message.match(/"([^"]+)"/);
  return match?.[1] ?? null;
}

function extractParentComplaintParentName(message: string): string | null {
  const match = message.match(
    /^Please check complaints\. (.+) submitted "[^"]+"\.$/,
  );
  return match?.[1] ?? null;
}

export function getLocalizedNotificationTypeLabel(
  type: NotificationType,
  t: NotificationTranslate,
): string {
  const key = `notifications.types.${type}`;
  const translated = t(key);
  if (translated !== key) return translated;
  return NOTIFICATION_TYPE_LABELS[type] ?? type;
}

export function getLocalizedNotificationDisplay(
  item: AppNotification,
  t: NotificationTranslate,
): { title: string; message: string; typeLabel: string } {
  const typeLabel = getLocalizedNotificationTypeLabel(item.type, t);

  if (item.type === "parent_complaint") {
    const { parentName, subject } = parseComplaintParams(item);
    return {
      typeLabel,
      title: t("notifications.parentComplaintTitle"),
      message: t("notifications.parentComplaintMessage", {
        parentName: parentName ?? "",
        subject: subject ?? "",
      }),
    };
  }

  if (item.type === "parent_complaint_resolved") {
    const { subject } = parseComplaintParams(item);
    return {
      typeLabel,
      title: t("notifications.parentComplaintResolvedTitle"),
      message: t("notifications.parentComplaintResolvedMessage", {
        subject: subject ?? "",
      }),
    };
  }

  return {
    typeLabel,
    title: item.title,
    message: item.message,
  };
}
