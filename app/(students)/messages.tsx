import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../src/services/firebase";
import {
  getAnnouncementSenderLine,
  isDirectAnnouncement,
} from "../../src/utils/announcementDisplay";
import { filterAnnouncementsForViewer } from "../../src/utils/announcementVisibility";
import { filterDismissedAnnouncements } from "../../src/services/dismissedContent";
import { AuthContext } from "../../src/context/authContext";
import { useDismissedContent } from "../../hooks/useDismissedContent";
import { SwipeToDeleteRow } from "../../components/common/SwipeToDeleteRow";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { studentScreenStyles as styles } from "../../components/students/studentScreenStyles";

export default function MessagesScreen() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);
  const [messages, setMessages] = useState<any[]>([]);
  const { dismissedKeys, dismiss } = useDismissedContent(user?.uid);

  useEffect(() => {
    const load = async () => {
      if (!userData?.classId || !user?.uid) return;
      const snap = await getDocs(
        collection(db, "classes", userData.classId, "announcements"),
      );
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(
        filterAnnouncementsForViewer(all, {
          userId: user.uid,
          role: "student",
          studentId: user.uid,
        }),
      );
    };

    void load();
  }, [userData?.classId, user?.uid]);

  const visibleMessages = useMemo(
    () =>
      filterDismissedAnnouncements(
        messages,
        userData?.classId ?? null,
        dismissedKeys,
      ),
    [messages, userData?.classId, dismissedKeys],
  );

  const handleDismiss = (messageId: string) => {
    const classId = userData?.classId;
    if (!classId) return;
    void dismiss("announcement", classId, messageId);
  };

  return (
    <StudentScreenShell
      title={t("student.messages")}
      showBack
      showMenu={false}
    >
      {visibleMessages.length === 0 ? (
        <Text style={styles.emptyText}>{t("common.noData")}</Text>
      ) : (
        visibleMessages.map((m) => {
          const senderLine = getAnnouncementSenderLine(m, t);
          const isDirect = isDirectAnnouncement(m);
          return (
            <SwipeToDeleteRow
              key={m.id}
              onDelete={() => handleDismiss(m.id)}
              webDismissLabel={t("common.delete")}
            >
              <View
                style={[
                  styles.listCard,
                  isDirect && styles.listCardDirect,
                ]}
              >
                {isDirect ? (
                  <Text style={styles.listCardBadge}>
                    {t("announcement.personalMessage")}
                  </Text>
                ) : null}
                {senderLine ? (
                  <Text style={styles.listCardSender}>{senderLine}</Text>
                ) : null}
                <Text style={styles.listCardTitle}>{m.title}</Text>
                <Text style={styles.listCardBody}>{m.text || m.message}</Text>
              </View>
            </SwipeToDeleteRow>
          );
        })
      )}
    </StudentScreenShell>
  );
}
