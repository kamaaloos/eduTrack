import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { DashboardSlideRow } from "../dashboard/DashboardSlideRow";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

type TeacherDashboardAnnouncementsSectionProps = {
  announcements: any[];
};

export function TeacherDashboardAnnouncementsSection({
  announcements,
}: TeacherDashboardAnnouncementsSectionProps) {
  const { t } = useTranslation();

  const openDetail = (item: {
    id: string;
    classId?: string;
    title?: string;
    text?: string;
    message?: string;
  }) => {
    if (!item.classId) return;
    router.push({
      pathname: "/(teachers)/announcement-detail",
      params: {
        id: item.id,
        classId: item.classId,
        title: item.title || "",
        body: item.text || item.message || "",
      },
    });
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {t("teacher.dashboard.schoolUpdates")}
        </Text>
      </View>

      <DashboardSlideRow variant="carousel">
        {announcements.length === 0 ? (
          <View style={styles.announcementCard}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {t("teacher.dashboard.noAnnouncements")}
            </Text>
          </View>
        ) : (
          announcements.map((item: any) => (
            <TouchableOpacity
              key={`${item.classId}-${item.id}`}
              style={styles.announcementCard}
              activeOpacity={0.85}
              onPress={() => openDetail(item)}
            >
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title || t("common.announcements")}
              </Text>
              <Text style={styles.cardText} numberOfLines={4}>
                {item.text || item.message || ""}
              </Text>
              <Text style={styles.cardReadMore}>{t("common.readMore")}</Text>
            </TouchableOpacity>
          ))
        )}
      </DashboardSlideRow>
    </View>
  );
}
