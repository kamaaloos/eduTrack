import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

type TeacherDashboardAnnouncementsSectionProps = {
  announcements: any[];
};

export function TeacherDashboardAnnouncementsSection({
  announcements,
}: TeacherDashboardAnnouncementsSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {t("teacher.dashboard.schoolUpdates")}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {announcements.length === 0 ? (
          <View style={styles.announcementCard}>
            <Text style={styles.cardTitle}>
              {t("teacher.dashboard.noAnnouncements")}
            </Text>
          </View>
        ) : (
          announcements.map((item: any) => (
            <View
              key={`${item.classId}-${item.id}`}
              style={styles.announcementCard}
            >
              <Text style={styles.cardTitle}>
                {item.title || t("common.announcements")}
              </Text>
              <Text style={styles.cardText}>
                {item.text || item.message || ""}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
