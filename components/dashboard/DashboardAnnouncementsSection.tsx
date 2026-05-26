import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getPreviewText } from "../../src/utils/dashboardUi";
import { DashboardSectionHeader } from "./DashboardSectionHeader";
import { dashboardStyles as styles } from "./dashboardStyles";
import type { StudentDashboardNavigation } from "./studentDashboardTypes";

type DashboardAnnouncementsSectionProps = {
  messages: any[];
  classId: string | null;
  useParentRoutes: boolean;
  navigation: StudentDashboardNavigation;
  listRoute?: string;
};

export function DashboardAnnouncementsSection({
  messages,
  classId,
  useParentRoutes,
  navigation,
  listRoute,
}: DashboardAnnouncementsSectionProps) {
  const { t } = useTranslation();
  const { openStudentDetail, openParentDetail, routePrefix } = navigation;

  return (
    <View style={styles.section}>
      <DashboardSectionHeader
        title={`📢 ${t("common.announcements")}`}
        route={listRoute}
        viewAllLabel={t("common.seeAll")}
      />

      {messages.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t("common.noData")}</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {messages.map((item: any) => {
            const fullBody = item.text || item.message || "";
            const { preview } = getPreviewText(fullBody);

            return (
              <View
                key={item.id}
                style={[styles.slideCard, styles.messageCardAccent]}
              >
                <View style={styles.slideCardTop}>
                  <View style={styles.messageIconWrap}>
                    <Ionicons
                      name="chatbubble-ellipses"
                      size={18}
                      color="#2563EB"
                    />
                  </View>
                  <Text style={styles.slideCardTitle} numberOfLines={1}>
                    {item.title || t("common.announcements")}
                  </Text>
                </View>

                <Text style={styles.slideCardText} numberOfLines={2}>
                  {preview || t("common.notAvailable")}
                </Text>

                {fullBody.length > 0 ? (
                  <TouchableOpacity
                    onPress={() =>
                      useParentRoutes
                        ? openParentDetail({
                            kind: "announcement",
                            id: item.id,
                            classId: classId || "",
                            title: item.title || "",
                            body: fullBody,
                          })
                        : openStudentDetail(`${routePrefix}/announcement-detail`, {
                            id: item.id,
                            classId: classId || "",
                            title: item.title || "",
                            body: fullBody,
                          })
                    }
                  >
                    <Text style={styles.slideCardAction}>
                      {t("common.readMore")}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
