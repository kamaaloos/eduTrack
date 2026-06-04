type AnnouncementLike = {
  direct?: boolean;
  senderName?: string | null;
  senderRole?: string | null;
  teacherName?: string | null;
};

export function getAnnouncementSenderLine(
  item: AnnouncementLike,
  t: (key: string, options?: Record<string, string>) => string,
): string | null {
  const senderName =
    (typeof item.senderName === "string" && item.senderName.trim()) ||
    (typeof item.teacherName === "string" && item.teacherName.trim()) ||
    "";

  if (item.direct === true) {
    if (senderName) {
      if (item.senderRole === "teacher") {
        return t("announcement.personalFromTeacher", { name: senderName });
      }
      if (item.senderRole === "admin") {
        return t("announcement.personalFromAdmin", { name: senderName });
      }
      return t("announcement.personalFromSender", { name: senderName });
    }
    return t("announcement.personalMessage");
  }

  if (senderName) {
    if (item.senderRole === "teacher" || item.teacherName) {
      return t("announcement.fromTeacher", { name: senderName });
    }
    if (item.senderRole === "admin") {
      return t("announcement.fromAdmin", { name: senderName });
    }
    return t("announcement.fromSender", { name: senderName });
  }

  return null;
}

export function isDirectAnnouncement(item: AnnouncementLike): boolean {
  return item.direct === true;
}
