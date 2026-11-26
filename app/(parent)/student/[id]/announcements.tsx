import { collection, getDocs } from "firebase/firestore";
import { router } from "expo-router";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text } from "react-native";
import { SwipeToDeleteRow } from "../../../../components/common/SwipeToDeleteRow";
import { StudentScreenShell } from "../../../../components/students/StudentScreenShell";
import { studentScreenStyles as styles } from "../../../../components/students/studentScreenStyles";
import { useDismissedContent } from "../../../../hooks/useDismissedContent";
import { useParentChildRoute } from "../../../../hooks/useParentChildRoute";
import { FLOATING_TAB_BAR_INSET } from "../../../../src/constants/tabBar";
import { AuthContext } from "../../../../src/context/authContext";
import { filterDismissedAnnouncements } from "../../../../src/services/dismissedContent";
import { db } from "../../../../src/services/firebase";
import {
  getAnnouncementSenderLine,
  isDirectAnnouncement,
} from "../../../../src/utils/announcementDisplay";
import { filterAnnouncementsForViewer } from "../../../../src/utils/announcementVisibility";

export default function ParentChildAnnouncementsScreen() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { studentId, classId, displayName } = useParentChildRoute();
  const [items, setItems] = useState<any[]>([]);
  const { dismissedKeys, dismiss } = useDismissedContent(user?.uid);

  useEffect(() => {
    const load = async () => {
      if (!classId || !user?.uid || !studentId) {
        setItems([]);
        return;
      }
      const snap = await getDocs(
        collection(db, "classes", classId, "announcements"),
      );
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(
        filterAnnouncementsForViewer(all, {
          userId: user.uid,
          role: "parent",
          studentId,
        }).filter((a) => !isDirectAnnouncement(a)),
      );
    };
    void load();
  }, [classId, user?.uid, studentId]);

  const visible = useMemo(
    () => filterDismissedAnnouncements(items, classId ?? null, dismissedKeys),
    [items, classId, dismissedKeys],
  );

  return (
    <StudentScreenShell
      title={t("tabs.student.announcements")}
      subtitle={displayName}
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
                if (!classId) return;
                void dismiss("announcement", classId, m.id);
              }}
              webDismissLabel={t("common.delete")}
            >
              <Pressable
                style={styles.listCard}
                onPress={() =>
                  router.push({
                    pathname: "/(parent)/detail",
                    params: {
                      kind: "announcement",
                      id: m.id,
                      classId: classId ?? "",
                      studentId,
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
