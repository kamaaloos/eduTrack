import { router, useLocalSearchParams } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/services/firebase";
import { hasParentAttendanceResponse } from "../../src/services/parentAttendanceResponse";
import {
  getAbsenceReasonLabel,
  getAttendanceStatusLabel,
} from "../../src/utils/attendanceLabels";

export default function ParentDetailScreen() {
  const { t } = useTranslation();
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

  const title =
    (item?.title as string) ||
    paramTitle ||
    (kind === "attendance" ? t("common.attendance") : t("common.details"));

  const body =
    (item?.details as string) ||
    (item?.description as string) ||
    (item?.text as string) ||
    (item?.message as string) ||
    (item?.remark as string) ||
    paramBody ||
    paramRemark ||
    "";

  const attendanceStatus =
    (loadedAttendance?.status as string) || paramStatus || "";
  const attendanceNeedsResponse =
    kind === "attendance" &&
    attendanceStatus === "absent" &&
    loadedAttendance &&
    !hasParentAttendanceResponse(
      loadedAttendance as { parentResponse?: unknown },
    );
  const parentResponse = loadedAttendance?.parentResponse as
    | { reason?: string; reasonCode?: string }
    | undefined;
  const parentReasonLabel = getAbsenceReasonLabel(
    t,
    parentResponse?.reasonCode,
    parentResponse?.reason || paramParentReason,
  );
  const attendanceStatusLabel = getAttendanceStatusLabel(
    t,
    attendanceStatus,
    loadedAttendance?.parentResponse as { reasonCode?: string; reason?: string },
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{title}</Text>

      {paramTeacher ? (
        <Text style={styles.meta}>
          {t("common.teacher")}: {paramTeacher}
        </Text>
      ) : null}
      {paramType ? (
        <Text style={styles.meta}>
          {t("common.status")}: {paramType}
        </Text>
      ) : null}
      {paramDate ? (
        <Text style={styles.meta}>
          {t("common.date")}: {paramDate}
        </Text>
      ) : null}
      {attendanceStatus ? (
        <Text style={styles.meta}>
          {t("common.status")}: {attendanceStatusLabel}
        </Text>
      ) : null}
      {parentReasonLabel ? (
        <Text style={styles.meta}>
          {t("parent.reportAbsenceReason")}: {parentReasonLabel}
        </Text>
      ) : null}

      {attendanceNeedsResponse ? (
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() =>
            router.push({
              pathname: "/(parent)/respond-attendance",
              params: {
                attendanceId: id,
                date: paramDate,
                studentName: paramTitle || undefined,
              },
            })
          }
        >
          <Text style={styles.ctaText}>{t("parent.respondExplain")}</Text>
        </TouchableOpacity>
      ) : null}

      {item?.subject ? (
        <Text style={styles.meta}>
          {t("common.subject")}: {String(item.subject)}
        </Text>
      ) : null}
      {item?.daysLeft != null ? (
        <Text style={styles.meta}>
          {t("student.dueDate", { date: String(item.daysLeft) })}
        </Text>
      ) : null}
      {item?.marks != null ? (
        <Text style={styles.meta}>
          {t("common.score")}: {String(item.marks)}
        </Text>
      ) : null}

      <View style={styles.bodyCard}>
        <Text style={styles.body}>{body || t("common.notAvailable")}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  content: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  meta: { fontSize: 15, color: "#64748B", marginBottom: 6 },
  bodyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginTop: 12,
  },
  body: { fontSize: 16, lineHeight: 24, color: "#334155" },
  ctaButton: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  ctaText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});
