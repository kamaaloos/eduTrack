import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import {
  getTodayDayKey,
  scheduleDateTimeLine,
  scheduleSubjectTeacherLine,
} from "../../src/utils/scheduleFormat";
import { DashboardSectionHeader } from "./DashboardSectionHeader";
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
        title={`📅 ${t("common.today")} (${todayLabel})`}
        viewAllLabel={t("common.seeAll")}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        {visibleSchedule.length === 0 ? (
          <View style={[styles.slideCard, styles.scheduleNoClassesCard]}>
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
            const isCurrent = item.id === currentScheduleId;
            return (
              <View
                key={item.id}
                style={[
                  styles.slideCard,
                  styles.scheduleSlideCard,
                  isCurrent && styles.scheduleSlideCardCurrent,
                ]}
              >
                {isCurrent ? (
                  <Text style={styles.scheduleNowBadge}>{t("common.today")}</Text>
                ) : null}
                <Text
                  style={[
                    styles.scheduleDateTime,
                    isCurrent && styles.scheduleDateTimeCurrent,
                  ]}
                  numberOfLines={2}
                >
                  {scheduleDateTimeLine(item, todayKey)}
                </Text>
                <Text
                  style={[
                    styles.scheduleSubject,
                    isCurrent && styles.scheduleSubjectCurrent,
                  ]}
                  numberOfLines={2}
                >
                  {scheduleSubjectTeacherLine(item)}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
