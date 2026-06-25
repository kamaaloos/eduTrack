import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { SwipeToDeleteRow } from "../../components/common/SwipeToDeleteRow";
import { ParentScreenShell } from "../../components/parent/ParentScreenShell";
import { studentScreenStyles } from "../../components/students/studentScreenStyles";
import { useDismissedContent } from "../../hooks/useDismissedContent";
import { AuthContext } from "../../src/context/authContext";
import { innerCardBorderStyle } from "../../src/constants/innerCardBorders";
import { hasParentAttendanceResponse } from "../../src/services/parentAttendanceResponse";
import { db } from "../../src/services/firebase";
import {
  getAbsenceReasonLabel,
  getAttendanceStatusLabel,
} from "../../src/utils/attendanceLabels";
import {
  confirmDestructiveAction,
  showErrorAlert,
} from "../../src/utils/confirmDialog";
import { getAttendanceColor } from "../../src/utils/dashboardUi";

function formatDisplayDate(dateStr: string): string {
  if (!dateStr?.trim()) return "";
  const parsed = new Date(`${dateStr.trim()}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isMeaningfulText(
  text: string | undefined,
  unknownLabel: string,
  notAvailableLabel: string,
): boolean {
  const trimmed = text?.trim();
  if (!trimmed) return false;
  if (trimmed === unknownLabel || trimmed === notAvailableLabel) return false;
  return true;
}

function kindIcon(kind: string): keyof typeof Ionicons.glyphMap {
  switch (kind) {
    case "attendance":
      return "calendar-outline";
    case "homework":
      return "book-outline";
    case "exam":
      return "school-outline";
    case "remark":
      return "chatbox-ellipses-outline";
    case "announcement":
      return "megaphone-outline";
    default:
      return "document-text-outline";
  }
}

function kindLabelKey(kind: string): string {
  switch (kind) {
    case "attendance":
      return "common.attendance";
    case "homework":
      return "student.homework";
    case "exam":
      return "common.exams";
    case "remark":
      return "common.remarks";
    case "announcement":
      return "common.announcements";
    default:
      return "common.details";
  }
}

type DetailMetaRowProps = {
  label: string;
  value: string;
  valueColor?: string;
};

function DetailMetaRow({ label, value, valueColor }: DetailMetaRowProps) {
  return (
    <View style={[studentScreenStyles.detailCard, innerCardBorderStyle]}>
      <View style={studentScreenStyles.detailMetaRow}>
        <Text style={studentScreenStyles.detailMetaLabel}>{label}</Text>
        <Text
          style={[
            studentScreenStyles.detailMetaValue,
            valueColor ? { color: valueColor } : null,
          ]}
          numberOfLines={3}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

type DetailSectionProps = {
  label: string;
  body: string;
};

function DetailSection({ label, body }: DetailSectionProps) {
  return (
    <>
      <Text style={studentScreenStyles.detailSectionLabel}>{label}</Text>
      <View style={[studentScreenStyles.detailCard, innerCardBorderStyle]}>
        <Text style={studentScreenStyles.detailBody}>{body}</Text>
      </View>
    </>
  );
}

export default function ParentDetailScreen() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { dismiss } = useDismissedContent(user?.uid);
  const params = useLocalSearchParams<{
    kind?: string;
    id?: string;
    classId?: string;
    title?: string;
    body?: string;
    teacher?: string;
    type?: string;
    date?: string;
    status?: string;
    remark?: string;
    parentReason?: string;
  }>();

  const kind = String(params.kind ?? "");
  const id = String(params.id ?? "");
  const classId = String(params.classId ?? "");
  const paramTitle = String(params.title ?? "");
  const paramBody = String(params.body ?? "");
  const paramTeacher = String(params.teacher ?? "");
  const paramType = String(params.type ?? "");
  const paramDate = String(params.date ?? "");
  const paramStatus = String(params.status ?? "");
  const paramRemark = String(params.remark ?? "");
  const paramParentReason = String(params.parentReason ?? "");

  const hasInlineContent = Boolean(paramBody || paramTitle);

  const inlineItem = useMemo(
    () =>
      hasInlineContent
        ? {
            title: paramTitle,
            text: paramBody,
            message: paramBody,
            teacher: paramTeacher,
            type: paramType,
            date: paramDate,
            status: paramStatus,
            remark: paramRemark,
          }
        : null,
    [
      hasInlineContent,
      paramTitle,
      paramBody,
      paramTeacher,
      paramType,
      paramDate,
      paramStatus,
      paramRemark,
    ],
  );

  const [fetchedItem, setFetchedItem] = useState<Record<string, unknown> | null>(
    null,
  );
  const [loadedAttendance, setLoadedAttendance] = useState<Record<
    string,
    unknown
  > | null>(null);

  useEffect(() => {
    if (hasInlineContent) {
      setFetchedItem(null);
      setLoadedAttendance(null);
      return;
    }

    if (kind === "attendance" && id) {
      let cancelled = false;
      setFetchedItem(null);

      (async () => {
        try {
          const snap = await getDoc(doc(db, "attendance", id));
          if (!cancelled && snap.exists()) {
            setLoadedAttendance({ id: snap.id, ...snap.data() });
          } else if (!cancelled) {
            setLoadedAttendance(null);
          }
        } catch (err) {
          console.error("Parent attendance detail load error:", err);
          if (!cancelled) setLoadedAttendance(null);
        }
      })();

      return () => {
        cancelled = true;
      };
    }

    setLoadedAttendance(null);

    if (!id || !classId) {
      setFetchedItem(null);
      return;
    }

    const col =
      kind === "homework"
        ? "homework"
        : kind === "exam"
          ? "exams"
          : kind === "remark"
            ? "remarks"
            : kind === "announcement"
              ? "announcements"
              : null;

    if (!col) {
      setFetchedItem(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const snap = await getDoc(doc(db, "classes", classId, col, id));
        if (!cancelled) {
          setFetchedItem(
            snap.exists() ? { id: snap.id, ...snap.data() } : null,
          );
        }
      } catch (err) {
        console.error("Parent detail load error:", err);
        if (!cancelled) setFetchedItem(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasInlineContent, kind, id, classId]);

  const item = inlineItem ?? fetchedItem;
  const unknownLabel = t("common.unknown");
  const notAvailableLabel = t("common.notAvailable");

  const screenSubtitle =
    (item?.title as string) ||
    paramTitle ||
    (kind === "attendance" ? t("common.attendance") : t("common.details"));

  const attendanceRecord = loadedAttendance ?? (kind === "attendance" ? item : null);
  const attendanceStatus =
    (attendanceRecord?.status as string) || paramStatus || "";
  const attendanceDate =
    (attendanceRecord?.date as string) || paramDate || "";
  const parentResponse = attendanceRecord?.parentResponse as
    | { reason?: string; reasonCode?: string }
    | undefined;

  const attendanceNeedsResponse =
    kind === "attendance" &&
    attendanceStatus === "absent" &&
    attendanceRecord &&
    !hasParentAttendanceResponse(
      attendanceRecord as { parentResponse?: unknown },
    );

  const parentReasonLabel = getAbsenceReasonLabel(
    t,
    parentResponse?.reasonCode,
    parentResponse?.reason || paramParentReason,
  );

  const attendanceStatusLabel = getAttendanceStatusLabel(
    t,
    attendanceStatus,
    parentResponse,
  );

  const attendanceColors = getAttendanceColor(
    attendanceStatus.toLowerCase(),
    parentResponse,
  );

  const teacherNote =
    (attendanceRecord?.remark as string) ||
    paramRemark ||
    "";

  const showParentReason =
    kind === "attendance" &&
    attendanceStatus === "absent" &&
    isMeaningfulText(parentReasonLabel, unknownLabel, notAvailableLabel);

  const showTeacherNote =
    kind === "attendance" &&
    isMeaningfulText(teacherNote, unknownLabel, notAvailableLabel) &&
    teacherNote.trim() !== parentReasonLabel.trim();

  const body =
    (item?.details as string) ||
    (item?.description as string) ||
    (item?.text as string) ||
    (item?.message as string) ||
    paramBody ||
    "";

  const showGenericBody =
    kind !== "attendance" &&
    isMeaningfulText(body, unknownLabel, notAvailableLabel);

  const handleDismissAnnouncement = () => {
    if (!classId || !id) {
      router.back();
      return;
    }

    void (async () => {
      const confirmed = await confirmDestructiveAction(
        t("common.delete"),
        t("announcement.dismissConfirm"),
        t("common.delete"),
        t("common.cancel"),
      );
      if (!confirmed) return;

      try {
        await dismiss("announcement", classId, id);
        router.back();
      } catch (err) {
        showErrorAlert(
          t("common.error"),
          err instanceof Error ? err.message : t("common.somethingWentWrong"),
        );
      }
    })();
  };

  const content = (
    <View style={studentScreenStyles.listStack}>
      <View style={styles.kindBadge}>
        <Ionicons name={kindIcon(kind)} size={14} color="#1D4ED8" />
        <Text style={styles.kindBadgeText}>{t(kindLabelKey(kind))}</Text>
      </View>

      {kind === "attendance" ? (
        <>
          <View
            style={[
              styles.heroCard,
              innerCardBorderStyle,
              {
                backgroundColor: attendanceColors.bg,
                borderTopColor: attendanceColors.border,
              },
            ]}
          >
            <View
              style={[
                styles.statusPill,
                { backgroundColor: attendanceColors.border },
              ]}
            >
              <Text style={styles.statusPillText}>{attendanceStatusLabel}</Text>
            </View>
            <Text style={styles.heroDate}>
              {formatDisplayDate(attendanceDate) || attendanceDate || "—"}
            </Text>
            {attendanceDate && formatDisplayDate(attendanceDate) ? (
              <Text style={styles.heroDateShort}>{attendanceDate}</Text>
            ) : null}
          </View>

          {attendanceNeedsResponse ? (
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() =>
                router.push({
                  pathname: "/(parent)/respond-attendance",
                  params: {
                    attendanceId: id,
                    date: attendanceDate,
                    studentName: paramTitle || undefined,
                  },
                })
              }
              activeOpacity={0.88}
            >
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
              <Text style={styles.ctaText}>{t("parent.respondExplain")}</Text>
            </TouchableOpacity>
          ) : null}

          {showParentReason ? (
            <DetailSection
              label={t("parent.reportAbsenceReason")}
              body={parentReasonLabel}
            />
          ) : null}

          {showTeacherNote ? (
            <DetailSection label={t("common.remarks")} body={teacherNote} />
          ) : null}
        </>
      ) : (
        <>
          {paramTeacher ? (
            <DetailMetaRow
              label={t("common.teacher")}
              value={paramTeacher}
            />
          ) : null}

          {paramType ? (
            <DetailMetaRow label={t("common.status")} value={paramType} />
          ) : null}

          {paramDate ? (
            <DetailMetaRow
              label={t("common.date")}
              value={formatDisplayDate(paramDate) || paramDate}
            />
          ) : null}

          {item?.subject ? (
            <DetailMetaRow
              label={t("common.subject")}
              value={String(item.subject)}
            />
          ) : null}

          {item?.daysLeft != null ? (
            <DetailMetaRow
              label={t("common.date")}
              value={t("student.dueDate", { date: String(item.daysLeft) })}
            />
          ) : null}

          {item?.marks != null ? (
            <DetailMetaRow
              label={t("common.score")}
              value={String(item.marks)}
              valueColor="#1D4ED8"
            />
          ) : null}

          {showGenericBody ? (
            kind === "announcement" ? (
              <SwipeToDeleteRow
                onDelete={handleDismissAnnouncement}
                webDismissLabel={t("common.delete")}
              >
                <View style={[studentScreenStyles.detailCard, innerCardBorderStyle]}>
                  <Text style={studentScreenStyles.detailSectionLabel}>
                    {t("common.details")}
                  </Text>
                  <Text style={[studentScreenStyles.detailBody, { marginTop: 8 }]}>
                    {body}
                  </Text>
                </View>
              </SwipeToDeleteRow>
            ) : (
              <DetailSection label={t("common.details")} body={body} />
            )
          ) : null}
        </>
      )}
    </View>
  );

  return (
    <ParentScreenShell
      title={t("common.details")}
      subtitle={screenSubtitle}
      showBack
      scroll
    >
      {content}
    </ParentScreenShell>
  );
}

const styles = StyleSheet.create({
  kindBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 4,
  },
  kindBadgeText: {
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  heroCard: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    borderTopWidth: 4,
    alignItems: "center",
    gap: 8,
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heroDate: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    lineHeight: 26,
  },
  heroDateShort: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#DC2626",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    width: "100%",
  },
  ctaText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
