import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { TeacherScreenShell } from "../../components/teachers/TeacherScreenShell";
import { teacherDashboardStyles as styles } from "../../components/teachers/teacherDashboardStyles";
import { db } from "../../src/services/firebase";
import { deleteClassAnnouncement } from "../../src/services/teacherAnnouncements";
import {
  confirmDestructiveAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";

export default function TeacherAnnouncementDetailScreen() {
  const { t } = useTranslation();
  const { id, classId, title: paramTitle, body: paramBody } =
    useLocalSearchParams<{
      id: string;
      classId?: string;
      title?: string;
      body?: string;
    }>();

  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id || !classId) {
      setItem({
        title: paramTitle || t("common.announcements"),
        text: paramBody || "",
      });
      return;
    }

    void (async () => {
      try {
        const snap = await getDoc(
          doc(db, "classes", String(classId), "announcements", String(id)),
        );
        if (snap.exists()) {
          setItem({ id: snap.id, ...snap.data() });
        } else {
          setItem({
            title: paramTitle || t("common.announcements"),
            text: paramBody || "",
          });
        }
      } catch {
        setItem({
          title: paramTitle || t("common.announcements"),
          text: paramBody || "",
        });
      }
    })();
  }, [id, classId, paramTitle, paramBody, t]);

  const screenTitle =
    String(item?.title ?? paramTitle ?? t("common.announcements"));
  const body = String(item?.text ?? item?.message ?? paramBody ?? "");

  const handleDelete = () => {
    if (!classId || !id) return;

    void (async () => {
      const confirmed = await confirmDestructiveAction(
        t("common.delete"),
        t("teacher.dashboard.deleteAnnouncementConfirm"),
        t("common.delete"),
        t("common.cancel"),
      );
      if (!confirmed) return;

      setDeleting(true);
      try {
        await deleteClassAnnouncement(String(classId), String(id));
        showSuccessAlert(t("common.success"), t("teacher.dashboard.announcementDeleted"));
        router.back();
      } catch (err) {
        showErrorAlert(
          t("common.error"),
          err instanceof Error ? err.message : t("common.somethingWentWrong"),
        );
      } finally {
        setDeleting(false);
      }
    })();
  };

  if (!item) {
    return (
      <TeacherScreenShell title={screenTitle} showBack scroll={false}>
        <View style={styles.detailLoading}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      </TeacherScreenShell>
    );
  }

  return (
    <TeacherScreenShell title={screenTitle} showBack>
      <View style={styles.detailCard}>
        <Text style={styles.detailBody}>
          {body || t("common.notAvailable")}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.detailDeleteBtn, deleting && styles.detailDeleteBtnDisabled]}
        onPress={handleDelete}
        disabled={deleting}
      >
        {deleting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.detailDeleteBtnText}>{t("common.delete")}</Text>
        )}
      </TouchableOpacity>
    </TeacherScreenShell>
  );
}
