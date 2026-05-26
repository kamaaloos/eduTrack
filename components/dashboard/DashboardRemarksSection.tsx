import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { hasParentAttendanceResponse } from "../../src/services/parentAttendanceResponse";
import {
  getAbsenceReasonLabel,
  getAttendanceStatusLabel,
} from "../../src/utils/attendanceLabels";
import {
  getAttendanceColor,
  getPreviewText,
  getRemarkColor,
} from "../../src/utils/dashboardUi";
import { DashboardSectionHeader } from "./DashboardSectionHeader";
import { dashboardStyles as styles } from "./dashboardStyles";
import type { StudentDashboardNavigation } from "./studentDashboardTypes";

type DashboardRemarksSectionProps = {
  remarksAndAttendance: any[];
  studentId: string;
  displayName: string;
  classId: string | null;
  useParentRoutes: boolean;
  navigation: StudentDashboardNavigation;
  listRoute?: string;
};

export function DashboardRemarksSection({
  remarksAndAttendance,
  studentId,
  displayName,
  classId,
  useParentRoutes,
  navigation,
  listRoute,
}: DashboardRemarksSectionProps) {
  const { t } = useTranslation();
  const { openStudentDetail, openParentDetail, routePrefix } = navigation;

  return (
    <View style={styles.section}>
      <DashboardSectionHeader
        title={`⭐ ${t("common.remarks")} & ${t("common.attendance")}`}
        route={listRoute}
        viewAllLabel={t("common.seeAll")}
      />

      {remarksAndAttendance.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t("student.noAttendance")}</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {remarksAndAttendance.map((item: any) => {
            if (item.feedType === "attendance") {
              const colors = getAttendanceColor(
                item.status,
                item.parentResponse,
              );
              const note = item.remark || "";
              const parentReasonText = getAbsenceReasonLabel(
                t,
                item.parentResponse?.reasonCode as string | undefined,
                item.parentResponse?.reason as string | undefined,
              );
              const { preview } = getPreviewText(
                parentReasonText || note,
              );
              const needsParentResponse =
                useParentRoutes &&
                item.status === "absent" &&
                !hasParentAttendanceResponse(item);

              return (
                <TouchableOpacity
                  key={`attendance-${item.id}`}
                  style={[
                    styles.slideCard,
                    {
                      backgroundColor: colors.bg,
                      borderTopColor: colors.border,
                      borderTopWidth: 3,
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (needsParentResponse) {
                      router.push({
                        pathname: "/(parent)/respond-attendance",
                        params: {
                          attendanceId: item.id,
                          studentId,
                          studentName: displayName,
                          date: item.date || "",
                        },
                      });
                      return;
                    }
                    if (useParentRoutes) {
                      openParentDetail({
                        kind: "attendance",
                        id: item.id,
                        date: item.date || "",
                        status: item.status || "",
                        remark: parentReasonText || note,
                        parentReason: parentReasonText || "",
                      });
                      return;
                    }
                    openStudentDetail(`${routePrefix}/attendance-detail`, {
                      id: item.id,
                      date: item.date || "",
                      status: item.status || "",
                      remark: parentReasonText || note,
                    });
                  }}
                >
                  <Text style={styles.feedBadge}>{t("common.attendance")}</Text>
                  <Text style={styles.slideCardTitle} numberOfLines={1}>
                    {item.date}
                  </Text>
                  <Text
                    style={[
                      styles.attendanceStatus,
                      { color: colors.text },
                    ]}
                  >
                    {getAttendanceStatusLabel(
                      t,
                      item.status,
                      item.parentResponse,
                    )}
                  </Text>
                  {parentReasonText || note ? (
                    <Text style={styles.slideCardText} numberOfLines={2}>
                      {preview}
                    </Text>
                  ) : (
                    <View />
                  )}
                  <Text
                    style={[
                      styles.slideCardAction,
                      needsParentResponse && styles.slideCardActionUrgent,
                    ]}
                  >
                    {needsParentResponse
                      ? t("dashboard.tapExplainAbsence")
                      : parentReasonText || note
                        ? `${t("common.readMore")} →`
                        : t("common.tapForDetails")}
                  </Text>
                </TouchableOpacity>
              );
            }

            const colors = getRemarkColor(item.type);
            const fullText = item.text || item.remark || "";
            const { preview } = getPreviewText(fullText);

            return (
              <TouchableOpacity
                key={`remark-${item.id}`}
                style={[
                  styles.slideCard,
                  {
                    backgroundColor: colors.bg,
                    borderTopColor: colors.border,
                    borderTopWidth: 3,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() =>
                  useParentRoutes
                    ? openParentDetail({
                        kind: "remark",
                        id: item.id,
                        classId: classId || "",
                        body: fullText,
                        teacher:
                          item.teacherName ||
                          item.teacher ||
                          t("common.teacher"),
                        type: item.type || "",
                      })
                    : openStudentDetail(`${routePrefix}/remark-detail`, {
                        id: item.id,
                        classId: classId || "",
                        body: fullText,
                        teacher:
                          item.teacherName ||
                          item.teacher ||
                          t("common.teacher"),
                        type: item.type || "",
                      })
                }
              >
                <Text style={styles.feedBadge}>{t("common.remarks")}</Text>
                <Text style={styles.slideCardTitle} numberOfLines={1}>
                  {item.teacherName || item.teacher || t("common.teacher")}
                </Text>
                {item.type ? (
                  <Text style={styles.slideCardSubtitle} numberOfLines={1}>
                    {item.type}
                  </Text>
                ) : (
                  <View />
                )}
                {fullText ? (
                  <Text style={styles.slideCardText} numberOfLines={2}>
                    {preview}
                  </Text>
                ) : (
                  <View />
                )}
                <Text style={styles.slideCardAction}>
                  {fullText
                    ? `${t("common.readMore")} →`
                    : t("common.tapForDetails")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
