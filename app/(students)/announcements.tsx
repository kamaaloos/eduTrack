import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { router } from "expo-router";
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
import { FLOATING_TAB_BAR_INSET } from "../../src/constants/tabBar";

export default function StudentAnnouncementsScreen() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);
  const [items, setItems] = useState<any[]>([]);
  const { dismissedKeys, dismiss } = useDismissedContent(user?.uid);

  useEffect(() => {
    const load = async () => {
      if (!userData?.classId || !user?.uid) return;
      const snap = await getDocs(
        collection(db, "classes", userData.classId, "announcements"),
      );
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(
        filterAnnouncementsForViewer(all, {
          userId: user.uid,
          role: "student",
          studentId: user.uid,
        }).filter((a) => !isDirectAnnouncement(a)),
      );
    };

    void load();
  }, [userData?.classId, user?.uid]);

  const visible = useMemo(
    () =>
      filterDismissedAnnouncements(
        items,
        userData?.classId ?? null,
        dismissedKeys,
      ),
    [items, userData?.classId, dismissedKeys],
  );

  return (
    <StudentScreenShell
      title={t("tabs.student.announcements")}
      showMenu={false}
      contentContainerStyle={{ paddingBottom: FLOATING_TAB_BAR_INSET + 24 }}
    >
      {visible.length === 0 ? (
        <Text style={styles.emptyText}>{t("common.noData")}</Text>
      ) : (
        visible.map((m) => {
          const senderLine = getAnnouncementSenderLine(m, t);
          return (
            <SwipeToDeleteRow
              key={m.id}
              onDelete={() => {
                const classId = userData?.classId;
                if (!classId) return;
                void dismiss("announcement", classId, m.id);
              }}
              webDismissLabel={t("common.delete")}
            >
              <Pressable
                style={styles.listCard}
                onPress={() =>
                  router.push({
                    pathname: "/(students)/announcement-detail",
                    params: {
                      id: m.id,
                      classId: userData?.classId ?? "",
                      title: m.title ?? "",
                    },
                  } as never)
                }
              >
                {senderLine ? (
                  <Text style={styles.listCardSender}>{senderLine}</Text>
                ) : null}
                <Text style={styles.listCardTitle}>{m.title}</Text>
                <Text style={styles.listCardBody}>{m.text || m.message}</Text>
              </Pressable>
            </SwipeToDeleteRow>
          );
        })
      )}
    </StudentScreenShell>
  );
}
