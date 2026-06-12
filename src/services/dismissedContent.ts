import {
  addDismissedKey,
  readDismissedKeys,
} from "../utils/dismissedContentStorage";

export type DismissedContentType = "announcement";

export function dismissedContentDocId(
  type: DismissedContentType,
  classId: string,
  itemId: string,
): string {
  return `${type}_${classId}_${itemId}`;
}

export function isAnnouncementDismissed(
  dismissedKeys: Set<string>,
  classId: string | null | undefined,
  itemId: string,
): boolean {
  if (!classId) return false;
  return dismissedKeys.has(
    dismissedContentDocId("announcement", classId, itemId),
  );
}

export function filterDismissedAnnouncements<T extends { id: string }>(
  items: T[],
  classId: string | null | undefined,
  dismissedKeys: Set<string>,
): T[] {
  if (!classId || dismissedKeys.size === 0) return items;
  return items.filter(
    (item) => !isAnnouncementDismissed(dismissedKeys, classId, item.id),
  );
}

/** Hide an announcement for this user on this device (local storage). */
export async function dismissAnnouncement(
  userId: string,
  schoolId: string,
  classId: string,
  itemId: string,
): Promise<void> {
  if (!userId || !schoolId || !classId || !itemId) return;

  const id = dismissedContentDocId("announcement", classId, itemId);
  await addDismissedKey(userId, schoolId, id);
}

export async function loadDismissedContentKeys(
  userId: string,
  schoolId: string,
): Promise<Set<string>> {
  if (!userId || !schoolId) return new Set();
  return readDismissedKeys(userId, schoolId);
}
