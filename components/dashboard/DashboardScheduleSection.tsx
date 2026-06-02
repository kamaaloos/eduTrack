import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import {
  getTodayDayKey,
  parseDayOfWeek,
  scheduleDateTimeLine,
  scheduleSubjectTeacherLine,
} from "../../src/utils/scheduleFormat";
import { DashboardSectionHeader } from "./DashboardSectionHeader";
import { DashboardSlideRow } from "./DashboardSlideRow";
import { dashboardStyles as styles } from "./dashboardStyles";

type DashboardScheduleSectionProps = {
  schedule: any[];
  visibleSchedule: any[];
  currentScheduleId: string | null;
  classId: string | null;
  todayLabel: string;
};

export function DashboardScheduleSection({
  schedule,
  visibleSchedule,
  currentScheduleId,
  classId,
  todayLabel,
}: DashboardScheduleSectionProps) {
  const { t } = useTranslation();
  const todayKey = getTodayDayKey();

  return (
    <View style={styles.section}>
      <DashboardSectionHeader
        title={t("dashboard.scheduleWeeklyTitle", { day: todayLabel })}
        icon="calendar-outline"
        viewAllLabel={t("common.seeAll")}
      />

      <DashboardSlideRow variant="carousel">
        {visibleSchedule.length === 0 ? (
          <View
            style={[
              styles.slideCard,
              styles.slideCardInCarousel,
              styles.scheduleNoClassesCard,
            ]}
          >
            <Text style={styles.scheduleNoClassesTitle}>
              {t("common.noData")}
            </Text>
            <Text style={styles.scheduleNoClassesText}>
              {schedule.length === 0
                ? classId
                  ? t("dashboard.scheduleNothingToday", { day: todayLabel })
                  : t("dashboard.scheduleNoClass")
                : t("dashboard.scheduleEmptyToday")}
            </Text>
          </View>
        ) : (
          visibleSchedule.map((item: any) => {
            const isToday = parseDayOfWeek(item.dayOfWeek || "") === todayKey;
            const isCurrent = item.id === currentScheduleId && isToday;
            return (
              <View
                key={item.id}
                style={[
                  styles.slideCard,
                  styles.slideCardInCarousel,
                  styles.scheduleSlideCard,
                  isToday && styles.scheduleSlideCardToday,
                  isCurrent && styles.scheduleSlideCardCurrent,
                ]}
              >
                {isToday ? (
                  <Text style={styles.scheduleNowBadge}>{t("common.today")}</Text>
                ) : null}
                <Text
                  style={[
                    styles.scheduleDateTime,
                    isToday && styles.scheduleDateTimeToday,
                  ]}
                  numberOfLines={2}
                >
                  {scheduleDateTimeLine(item)}
                </Text>
                <Text
                  style={[
                    styles.scheduleSubject,
                    isToday && styles.scheduleSubjectToday,
                  ]}
                  numberOfLines={2}
                >
                  {scheduleSubjectTeacherLine(item)}
                </Text>
              </View>
            );
          })
        )}
      </DashboardSlideRow>
    </View>
  );
}
