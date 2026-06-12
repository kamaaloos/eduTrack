import { useContext, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { db } from "../../src/services/firebase";
import { getAnnouncementSenderLine } from "../../src/utils/announcementDisplay";
import { useDismissedContent } from "../../hooks/useDismissedContent";
import { SwipeToDeleteRow } from "../../components/common/SwipeToDeleteRow";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { studentScreenStyles as styles } from "../../components/students/studentScreenStyles";
import {
  confirmDestructiveAction,
  showErrorAlert,
} from "../../src/utils/confirmDialog";

export default function AnnouncementDetailScreen() {
  const { t } = useTranslation();
  const { id, classId: paramClassId, title: paramTitle, body: paramBody } =
    useLocalSearchParams<{
      id: string;
      classId?: string;
      title?: string;
      body?: string;
    }>();
  const { user, userData } = useContext(AuthContext);
  const { dismiss } = useDismissedContent(user?.uid);
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fallbackTitle = paramTitle || t("common.announcements");
    const classId = paramClassId || userData?.classId;
    if (!classId) {
      setItem({
        title: fallbackTitle,
        text: paramBody || "",
      });
      return;
    }

    (async () => {
      try {
        const snap = await getDoc(
          doc(db, "classes", classId, "announcements", String(id)),
        );
        if (snap.exists()) {
          setItem({ id: snap.id, ...snap.data() });
        } else {
          setItem({
            title: fallbackTitle,
            text: paramBody || "",
          });
        }
      } catch {
        setItem({
          title: fallbackTitle,
          text: paramBody || "",
        });
      }
    })();
  }, [id, paramClassId, userData?.classId, paramTitle, paramBody, t]);

  const fullText = item?.text || item?.message || paramBody || "";
  const screenTitle =
    item?.title || paramTitle || t("common.announcements");
  const senderLine = item ? getAnnouncementSenderLine(item, t) : null;
  const resolvedClassId = paramClassId || userData?.classId || "";

  const handleDelete = () => {
    if (!resolvedClassId || !id) {
      router.back();
      return;
    }

    void (async () => {
      const confirmed = await confirmDestructiveAction(
        t("common.delete"),
        t("announcement.dismissConfirm"),
        t("common.delete"),
        t("common.cancel"),
      );
      if (!confirmed) return;

      try {
        await dismiss("announcement", resolvedClassId, String(id));
        router.back();
      } catch (err) {
        showErrorAlert(
          t("common.error"),
          err instanceof Error ? err.message : t("common.somethingWentWrong"),
        );
      }
    })();
  };

  if (!item) {
    return (
      <StudentScreenShell title={screenTitle} showBack showMenu={false}>
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </StudentScreenShell>
    );
  }

  return (
    <StudentScreenShell title={screenTitle} showBack showMenu={false}>
      <SwipeToDeleteRow onDelete={handleDelete}>
        <View style={styles.detailCard}>
          {senderLine ? (
            <Text style={styles.detailSender}>{senderLine}</Text>
          ) : null}
          <Text style={styles.detailBody}>
            {fullText || t("common.notAvailable")}
          </Text>
        </View>
      </SwipeToDeleteRow>

      <TouchableOpacity
        style={styles.detailDeleteBtn}
        onPress={handleDelete}
        accessibilityRole="button"
      >
        <Text style={styles.detailDeleteBtnText}>{t("common.delete")}</Text>
      </TouchableOpacity>
    </StudentScreenShell>
  );
}
