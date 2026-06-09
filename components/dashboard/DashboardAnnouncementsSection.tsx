import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { getPreviewText } from "../../src/utils/dashboardUi";
import {
  getAnnouncementSenderLine,
  isDirectAnnouncement,
} from "../../src/utils/announcementDisplay";
import { DashboardSectionHeader } from "./DashboardSectionHeader";
import { DashboardSlideRow } from "./DashboardSlideRow";
import { dashboardStyles as styles, studentSlideCardStyle } from "./dashboardStyles";
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
        title={t("common.announcements")}
        icon="megaphone-outline"
        route={listRoute}
        viewAllLabel={t("common.seeAll")}
      />

      {messages.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t("common.noData")}</Text>
        </View>
      ) : (
        <DashboardSlideRow variant="carousel">
          {messages.map((item: any) => {
            const fullBody = item.text || item.message || "";
            const { preview } = getPreviewText(fullBody);
            const senderLine = getAnnouncementSenderLine(item, t);
            const isDirect = isDirectAnnouncement(item);

            return (
              <View
                key={item.id}
                style={studentSlideCardStyle(
                  styles.messageCardAccent,
                  ...(isDirect ? [styles.messageCardDirect] : []),
                )}
              >
                {isDirect ? (
                  <View style={styles.messagePersonalBadge}>
                    <Text style={styles.messagePersonalBadgeText}>
                      {t("announcement.personalMessage")}
                    </Text>
                  </View>
                ) : null}
                {senderLine ? (
                  <Text style={styles.messageSenderLine} numberOfLines={1}>
                    {senderLine}
                  </Text>
                ) : null}
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
        </DashboardSlideRow>
      )}
    </View>
  );
}
