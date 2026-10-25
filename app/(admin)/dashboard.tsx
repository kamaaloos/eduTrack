import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { AdminScreenShell } from "../../components/admin/AdminScreenShell";
import { AdminWebDashboardBody } from "../../components/admin/web/AdminWebDashboardBody";
import { AuthContext } from "../../src/context/authContext";
import { useAdminData } from "../../src/context/adminDataContext";
import { useSchoolContext } from "../../src/context/schoolContext";
import {
  notifySchoolTestingEnded,
  notifySchoolTestingExpiring,
  notifySchoolUsageEnded,
  notifySchoolUsageExpiring,
} from "../../src/services/notificationEvents";
import { isIgnorableFirestoreListenerError } from "../../src/services/firestoreSession";
import { getUsageRemainingDays } from "../../src/utils/usageExpiry";
import {
  isTestingPeriodActive,
  resolveAdminDashboardPeriodNotice,
} from "../../src/utils/adminDashboardPeriodNotice";
import type { StoredSchool } from "../../src/types/school";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { selectedSchool, refreshSelectedSchoolFromRegistry } = useSchoolContext();
  const {
    students,
    teachers,
    parents,
    classes,
    refreshAll,
    syncClassIdsFromAssignments,
    loadUsers,
  } = useAdminData();

  const [refreshing, setRefreshing] = useState(false);

  const periodNotice = useMemo(
    () =>
      selectedSchool
        ? resolveAdminDashboardPeriodNotice(selectedSchool)
        : null,
    [selectedSchool],
  );

  const webPeriodNotice = useMemo(() => {
    if (!periodNotice) return null;
    return {
      remainingDays: periodNotice.remainingDays,
      title:
        periodNotice.kind === "testing"
          ? t("admin.testingPeriodNoticeTitle")
          : periodNotice.kind === "usage"
            ? t("admin.usageSubscriptionNoticeTitle")
            : t("admin.usageActivationNoticeTitle"),
      expiredText:
        periodNotice.kind === "testing"
          ? t("admin.testingExpiredNotice")
          : periodNotice.kind === "usage"
            ? t("admin.usageExpiredNotice")
            : t("admin.usageActivationExpiredNotice"),
      remainingText:
        periodNotice.kind === "activation_grace"
          ? t("admin.usageActivationRemainingDays", {
              count: periodNotice.remainingDays,
            })
          : t("admin.usageTimeRemainingDays", {
              count: periodNotice.remainingDays,
            }),
      hintText:
        periodNotice.kind === "testing"
          ? t("admin.testingContactHint")
          : periodNotice.kind === "usage"
            ? t("admin.usageRechargeHint")
            : t("admin.usageActivationHint"),
    };
  }, [periodNotice, t]);

  const reloadDashboard = useCallback(async () => {
    try {
      await refreshAll();
    } catch (err) {
      if (!isIgnorableFirestoreListenerError(err)) {
        console.warn("Dashboard refresh failed:", err);
      }
    }
    try {
      await syncClassIdsFromAssignments();
      await loadUsers();
    } catch (err) {
      if (!isIgnorableFirestoreListenerError(err)) {
        console.warn("Dashboard sync failed:", err);
      }
    }
  }, [refreshAll, syncClassIdsFromAssignments, loadUsers]);

  const maybeNotifySchoolPeriods = useCallback(
    async (school: Pick<StoredSchool, "id" | "name" | "testingExpiresAt" | "usageExpiresAt">) => {
      const notifyPeriod = async (
        expiresAt: string | null | undefined,
        expiring: (title: string, message: string) => Promise<void>,
        ended: (title: string, message: string) => Promise<void>,
        expiringTitle: string,
        expiringMessage: (count: number) => string,
        endedTitle: string,
        endedMessage: string,
      ) => {
        const remaining = getUsageRemainingDays(expiresAt);
        if (remaining == null) return;

        if (remaining <= 0) {
          await ended(endedTitle, endedMessage);
          return;
        }

        if (remaining > 7) return;

        await expiring(expiringTitle, expiringMessage(remaining));
      };

      await notifyPeriod(
        school.testingExpiresAt,
        (title, message) =>
          notifySchoolTestingExpiring({
            schoolId: school.id,
            title,
            message,
            actorId: user?.uid ?? null,
          }),
        (title, message) =>
          notifySchoolTestingEnded({
            schoolId: school.id,
            title,
            message,
            actorId: user?.uid ?? null,
          }),
        t("admin.testingExpiringNotificationTitle"),
        (count) => t("admin.testingExpiringNotificationMessage", { count }),
        t("admin.testingEndedNotificationTitle"),
        t("admin.testingEndedNotificationMessage"),
      );

      if (!isTestingPeriodActive(school)) {
        await notifyPeriod(
          school.usageExpiresAt,
          (title, message) =>
            notifySchoolUsageExpiring({
              schoolId: school.id,
              title,
              message,
              actorId: user?.uid ?? null,
            }),
          (title, message) =>
            notifySchoolUsageEnded({
              schoolId: school.id,
              title,
              message,
              actorId: user?.uid ?? null,
            }),
          t("admin.usageExpiringNotificationTitle"),
          (count) => t("admin.usageExpiringNotificationMessage", { count }),
          t("admin.usageEndedNotificationTitle"),
          t("admin.usageEndedNotificationMessage"),
        );
      }
    },
    [t, user?.uid],
  );

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        try {
          const school =
            (await refreshSelectedSchoolFromRegistry()) ?? selectedSchool;
          await reloadDashboard();
          if (school?.id && school.name) {
            try {
              await maybeNotifySchoolPeriods(school);
            } catch (err) {
              console.warn("admin period notifications skipped:", err);
            }
          }
        } catch (err) {
          console.warn("admin dashboard focus refresh failed:", err);
        }
      })();
    }, [
      reloadDashboard,
      maybeNotifySchoolPeriods,
      refreshSelectedSchoolFromRegistry,
      selectedSchool,
    ]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await reloadDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  const webShortcutsList = useMemo(
    () => [
      {
        key: "dir-students",
        label: t("admin.students"),
        icon: "people" as keyof typeof Ionicons.glyphMap,
        route: "/(admin)/user-directory/student",
        subtitle: String(students.length),
      },
      {
        key: "dir-teachers",
        label: t("admin.teachers"),
        icon: "briefcase" as keyof typeof Ionicons.glyphMap,
        route: "/(admin)/user-directory/teacher",
        subtitle: String(teachers.length),
      },
      {
        key: "dir-parents",
        label: t("admin.parents"),
        icon: "home" as keyof typeof Ionicons.glyphMap,
        route: "/(admin)/user-directory/parent",
        subtitle: String(parents.length),
      },
      {
        key: "dir-classes",
        label: t("admin.classes"),
        icon: "library" as keyof typeof Ionicons.glyphMap,
        route: "/(admin)/classes",
        subtitle: String(classes.length),
      },
      {
        key: "users",
        label: t("admin.users"),
        icon: "people-outline" as keyof typeof Ionicons.glyphMap,
        route: "/(admin)/users",
      },
      {
        key: "assignments",
        label: t("admin.assignments"),
        icon: "git-network-outline" as keyof typeof Ionicons.glyphMap,
        route: "/(admin)/assignments",
      },
      {
        key: "analytics",
        label: t("admin.analytics"),
        icon: "bar-chart-outline" as keyof typeof Ionicons.glyphMap,
        route: "/(admin)/analytics",
      },
      {
        key: "performance",
        label: t("admin.performance"),
        icon: "trending-up-outline" as keyof typeof Ionicons.glyphMap,
        route: "/(admin)/performance",
      },
      {
        key: "certificates",
        label: t("certificates.adminMenu"),
        icon: "document-text-outline" as keyof typeof Ionicons.glyphMap,
        route: "/(admin)/certificates",
      },
      {
        key: "complaints",
        label: t("admin.complaintsTitle"),
        icon: "chatbubble-ellipses-outline" as keyof typeof Ionicons.glyphMap,
        route: "/(admin)/complaints",
      },
      {
        key: "system",
        label: t("admin.system"),
        icon: "settings-outline" as keyof typeof Ionicons.glyphMap,
        route: "/(admin)/system",
      },
      {
        key: "profile",
        label: t("admin.myProfile"),
        icon: "person-circle-outline" as keyof typeof Ionicons.glyphMap,
        route: "/(admin)/profile",
      },
      {
        key: "notifications",
        label: t("admin.notificationsTitle"),
        icon: "notifications-outline" as keyof typeof Ionicons.glyphMap,
        route: "/(admin)/notifications",
      },
    ],
    [t, students.length, teachers.length, parents.length, classes.length],
  );

  return (
    <ErrorBoundary>
      <AdminScreenShell
        title={t("admin.dashboardTitle")}
        subtitle={t("admin.dashboardSubtitle")}
        showNotifications
        showCurrentTerm
        webExpandMain
      >
        <AdminWebDashboardBody
          adminUid={user?.uid}
          students={students.length}
          teachers={teachers.length}
          parents={parents.length}
          classes={classes.length}
          shortcuts={webShortcutsList}
          periodNotice={webPeriodNotice}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </AdminScreenShell>
    </ErrorBoundary>
  );
}
