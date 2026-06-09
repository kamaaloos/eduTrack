export type AnnouncementViewerRole = "student" | "parent";

export type AnnouncementViewer = {
  userId: string;
  role: AnnouncementViewerRole;
  /** Child student id when a parent is viewing. */
  studentId?: string;
};

type AnnouncementLike = {
  direct?: boolean;
  targetRole?: string;
  targetUserId?: string;
  studentId?: string;
};

export function isAnnouncementVisibleToViewer(
  item: AnnouncementLike,
  viewer: AnnouncementViewer,
): boolean {
  if (item.direct !== true) return true;

  if (item.targetRole === "student") {
    return viewer.role === "student" && item.targetUserId === viewer.userId;
  }

  if (item.targetRole === "parent") {
    if (viewer.role !== "parent" || item.targetUserId !== viewer.userId) {
      return false;
    }
    const contextStudentId = viewer.studentId;
    if (!contextStudentId || !item.studentId) return true;
    return item.studentId === contextStudentId;
  }

  return false;
}

export function filterAnnouncementsForViewer<T extends AnnouncementLike>(
  items: T[],
  viewer: AnnouncementViewer,
): T[] {
  return items.filter((item) => isAnnouncementVisibleToViewer(item, viewer));
}
