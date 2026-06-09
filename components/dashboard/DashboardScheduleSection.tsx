import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import {
  getScheduleDayBadgeLabel,
  getTodayDayKey,
  parseDayOfWeek,
  scheduleDateTimeLine,
  scheduleSubjectTeacherLine,
  weekdayDistanceFromToday,
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
  scheduleNow?: Date;
};

export function DashboardScheduleSection({
  schedule,
  visibleSchedule,
  currentScheduleId,
  classId,
  todayLabel,
  scheduleNow = new Date(),
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
            const dayKey = parseDayOfWeek(item.dayOfWeek || "");
            const isToday = dayKey === todayKey;
            const dayDistance = dayKey
              ? weekdayDistanceFromToday(dayKey, scheduleNow)
              : null;
            const isTomorrow = dayDistance === 1;
            const isCurrent = item.id === currentScheduleId && isToday;
            const dayBadge =
              dayKey != null
                ? getScheduleDayBadgeLabel(t, dayKey, scheduleNow)
                : null;
            return (
              <View
                key={item.id}
                style={[
                  styles.slideCard,
                  styles.slideCardInCarousel,
                  styles.scheduleSlideCard,
                  isToday && styles.scheduleSlideCardToday,
                  isTomorrow && !isToday && styles.scheduleSlideCardTomorrow,
                  isCurrent && styles.scheduleSlideCardCurrent,
                ]}
              >
                {dayBadge ? (
                  <Text
                    style={[
                      styles.scheduleDayBadge,
                      isToday && styles.scheduleDayBadgeToday,
                      isTomorrow && styles.scheduleDayBadgeTomorrow,
                    ]}
                  >
                    {dayBadge}
                  </Text>
                ) : null}
                <Text
                  style={[
                    styles.scheduleDateTime,
                    isToday && styles.scheduleDateTimeToday,
                    isTomorrow && styles.scheduleDateTimeTomorrow,
                  ]}
                  numberOfLines={3}
                >
                  {scheduleDateTimeLine(item, {
                    dayKey: dayKey ?? undefined,
                    t,
                    referenceDate: scheduleNow,
                  })}
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
