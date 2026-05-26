import { useCallback, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { useSchoolContext } from "../src/context/schoolContext";
import { db } from "../src/services/firebase";
import {
  isIgnorableFirestoreListenerError,
} from "../src/services/firestoreSession";
import {
  mapNotificationDoc,
  markNotificationRead,
  type AppNotification,
} from "../src/services/notifications";
import { useFirestoreListenerEffect } from "./useFirestoreListenerEffect";

export function useNotifications(userId: string | null | undefined) {
  const { selectedSchool } = useSchoolContext();
  const schoolKey = selectedSchool?.id ?? null;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useFirestoreListenerEffect(() => {
    if (!userId || !db || !schoolKey) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    return onSnapshot(
      query(
        collection(db, "notifications"),
        where("targetUserId", "==", userId),
      ),
      (snap) => {
        const items = snap.docs
          .map((d) => mapNotificationDoc(d.id, d.data() as Record<string, unknown>))
          .sort((a, b) => {
            const ta = a.createdAt?.getTime() ?? 0;
            const tb = b.createdAt?.getTime() ?? 0;
            return tb - ta;
          });
        setNotifications(items);
        setLoading(false);
      },
      (err) => {
        if (!isIgnorableFirestoreListenerError(err)) {
          console.error("notifications listener:", err);
        }
        setLoading(false);
      },
    );
  }, [userId, schoolKey]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
    } catch (err) {
      console.warn("markNotificationRead:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!db) return;
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    try {
      const batch = writeBatch(db);
      unread.forEach((n) => {
        batch.update(doc(db, "notifications", n.id), { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn("markAllRead:", err);
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
  };
}

export function useUnreadNotificationCount(userId: string | null | undefined) {
  const { unreadCount } = useNotifications(userId);
  return unreadCount;
}
