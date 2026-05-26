import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getPreviewText } from "../../src/utils/dashboardUi";
import { DashboardSectionHeader } from "./DashboardSectionHeader";
import { dashboardStyles as styles } from "./dashboardStyles";
import type { StudentDashboardNavigation } from "./studentDashboardTypes";

type DashboardExamsSectionProps = {
  exams: any[];
  visibleExams: any[];
  classId: string | null;
  useParentRoutes: boolean;
  navigation: StudentDashboardNavigation;
  listRoute?: string;
};

export function DashboardExamsSection({
  exams,
  visibleExams,
  classId,
  useParentRoutes,
  navigation,
  listRoute,
}: DashboardExamsSectionProps) {
  const { t } = useTranslation();
  const { openStudentDetail, openParentDetail, routePrefix } = navigation;

  return (
    <View style={styles.section}>
      <DashboardSectionHeader
        title={`📝 ${t("common.exams")}`}
        route={listRoute}
        viewAllLabel={t("common.seeAll")}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        {visibleExams.length === 0 ? (
          <View style={[styles.slideCard, styles.examNoWorkCard]}>
            <Text style={styles.hwNoWorkTitle}>{t("student.noExams")}</Text>
            <Text style={styles.hwNoWorkText}>
              {exams.length === 0
                ? t("dashboard.examsNoneScheduled")
                : t("dashboard.examsAllCaughtUp")}
            </Text>
          </View>
        ) : (
          visibleExams.map((item: any) => {
            const status =
              item.status === "Scheduled" || !item.status
                ? t("dashboard.scheduled")
                : item.status;
            const previewParts = [
              item.date ? t("dashboard.examDate", { date: item.date }) : null,
              item.marks != null
                ? t("dashboard.examMarks", { marks: item.marks })
                : null,
              t("dashboard.examStatus", { status }),
            ].filter(Boolean);
            const { preview } = getPreviewText(previewParts.join(" · "), 70);

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.slideCard, styles.examCardAccent]}
                activeOpacity={0.85}
                onPress={() =>
                  useParentRoutes
                    ? openParentDetail({
                        kind: "exam",
                        id: item.id,
                        classId: classId || "",
                        title: item.title || "",
                        body: item.details || item.description || "",
                      })
                    : openStudentDetail(`${routePrefix}/exam-detail`, {
                        id: item.id,
                        classId: classId || "",
                      })
                }
              >
                <Text style={styles.slideCardTitle} numberOfLines={1}>
                  {item.title || t("common.exams")}
                </Text>

                {item.subject ? (
                  <Text style={styles.slideCardSubtitle} numberOfLines={1}>
                    {item.subject}
                  </Text>
                ) : (
                  <View />
                )}

                <Text style={styles.slideCardText} numberOfLines={2}>
                  {preview}
                </Text>

                <Text style={styles.slideCardAction}>
                  {t("common.detailsArrow")}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
