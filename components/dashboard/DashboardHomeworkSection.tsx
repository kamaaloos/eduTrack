import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import type { HomeworkSlide } from "../../src/utils/academicFilters";
import { getHomeworkColor } from "../../src/utils/dashboardUi";
import { DashboardSectionHeader } from "./DashboardSectionHeader";
import { DashboardSlideRow } from "./DashboardSlideRow";
import { dashboardStyles as styles, studentSlideCardStyle } from "./dashboardStyles";
import type { StudentDashboardNavigation } from "./studentDashboardTypes";

type DashboardHomeworkSectionProps = {
  homework: any[];
  homeworkSlides: HomeworkSlide[];
  classId: string | null;
  useParentRoutes: boolean;
  navigation: StudentDashboardNavigation;
  listRoute?: string;
};

export function DashboardHomeworkSection({
  homework,
  homeworkSlides,
  classId,
  useParentRoutes,
  navigation,
  listRoute,
}: DashboardHomeworkSectionProps) {
  const { t } = useTranslation();
  const { openStudentDetail, openParentDetail, routePrefix } = navigation;

  return (
    <View style={styles.section}>
      <DashboardSectionHeader
        title={t("student.homework")}
        icon="book-outline"
        route={listRoute}
        viewAllLabel={t("common.seeAll")}
      />

      <DashboardSlideRow variant="carousel">
        {homeworkSlides.map((slide) => {
          if (slide.kind === "empty-all") {
            return (
              <View
                key="hw-empty-all"
                style={studentSlideCardStyle(styles.hwNoWorkCard)}
              >
                <Text style={styles.hwNoWorkTitle}>{t("student.noHomework")}</Text>
                <Text style={styles.hwNoWorkText}>
                  {homework.length === 0
                    ? t("dashboard.homeworkNothingAssigned")
                    : t("dashboard.homeworkNoActive")}
                </Text>
              </View>
            );
          }

          const item = slide.item as any;
          const colors = getHomeworkColor(slide.daysLeft);

          return (
            <TouchableOpacity
              key={item.id}
              style={studentSlideCardStyle()}
              activeOpacity={0.85}
              onPress={() =>
                useParentRoutes
                  ? openParentDetail({
                      kind: "homework",
                      id: item.id,
                      classId: classId || "",
                      title: item.title || "",
                      body: item.details || item.description || "",
                    })
                  : openStudentDetail(`${routePrefix}/homework-detail`, {
                      id: item.id,
                      classId: classId || "",
                    })
              }
            >
              <View style={styles.hwHeader}>
                <Text style={styles.slideCardTitle} numberOfLines={1}>
                  {item.title || t("student.homework")}
                </Text>
                <Text
                  style={[
                    styles.daysLeft,
                    {
                      backgroundColor: colors.bg,
                      color: colors.text,
                    },
                  ]}
                >
                  {t("dashboard.daysLeft", { count: slide.daysLeft })}
                </Text>
              </View>

              {item.subject ? (
                <Text style={styles.slideCardSubtitle} numberOfLines={1}>
                  {item.subject}
                </Text>
              ) : (
                <View />
              )}

              <Text style={styles.slideCardAction}>
                {t("common.detailsArrow")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </DashboardSlideRow>
    </View>
  );
}
