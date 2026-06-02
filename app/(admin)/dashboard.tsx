import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { AdminParentsOverview } from "../../components/admin/AdminParentsOverview";
import { AdminScreenShell } from "../../components/admin/AdminScreenShell";
import { AuthContext } from "../../src/context/authContext";
import { useAdminData } from "../../src/context/adminDataContext";
import { useSchoolContext } from "../../src/context/schoolContext";
import { platformShadow } from "../../src/utils/platformShadow";
import {
  notifySchoolTestingEnded,
  notifySchoolTestingExpiring,
  notifySchoolUsageEnded,
  notifySchoolUsageExpiring,
} from "../../src/services/notificationEvents";
import { getUsageRemainingDays } from "../../src/utils/usageExpiry";
import type { StoredSchool } from "../../src/types/school";

type MenuRoute =
  | "/(admin)/users"
  | "/(admin)/classes"
  | "/(admin)/assignments"
  | "/(admin)/system"
  | "/(admin)/profile";

type DirectoryRoute =
  | "/(admin)/user-directory/student"
  | "/(admin)/user-directory/teacher"
  | "/(admin)/user-directory/parent"
  | "/(admin)/class-directory";

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

  const testingRemainingDays = useMemo(
    () => getUsageRemainingDays(selectedSchool?.testingExpiresAt),
    [selectedSchool?.testingExpiresAt],
  );

  const usageRemainingDays = useMemo(
    () => getUsageRemainingDays(selectedSchool?.usageExpiresAt),
    [selectedSchool?.usageExpiresAt],
  );

  const directoryItems = useMemo(
    () => [
      {
        key: "dir-students",
        label: t("admin.students"),
        description: t("admin.dirStudentsDesc"),
        route: "/(admin)/user-directory/student" as DirectoryRoute,
        icon: "people" as keyof typeof Ionicons.glyphMap,
        color: "#2563EB",
      },
      {
        key: "dir-teachers",
        label: t("admin.teachers"),
        description: t("admin.dirTeachersDesc"),
        route: "/(admin)/user-directory/teacher" as DirectoryRoute,
        icon: "briefcase" as keyof typeof Ionicons.glyphMap,
        color: "#16A34A",
      },
      {
        key: "dir-parents",
        label: t("admin.parents"),
        description: t("admin.dirParentsDesc"),
        route: "/(admin)/user-directory/parent" as DirectoryRoute,
        icon: "home" as keyof typeof Ionicons.glyphMap,
        color: "#7C3AED",
      },
      {
        key: "dir-classes",
        label: t("admin.classes"),
        description: t("admin.dirClassesDesc"),
        route: "/(admin)/class-directory" as DirectoryRoute,
        icon: "library" as keyof typeof Ionicons.glyphMap,
        color: "#D97706",
      },
    ],
    [t],
  );

  const menuItems = useMemo(
    () => [
      {
        key: "profile",
        label: t("admin.myProfile"),
        description: t("admin.myProfileDesc"),
        route: "/(admin)/profile" as MenuRoute,
        icon: "person-circle-outline" as keyof typeof Ionicons.glyphMap,
        color: "#0EA5E9",
      },
      {
        key: "users",
        label: t("admin.users"),
        description: t("admin.usersDesc"),
        route: "/(admin)/users" as MenuRoute,
        icon: "people-outline" as keyof typeof Ionicons.glyphMap,
        color: "#2563EB",
      },
      {
        key: "classes",
        label: t("admin.classes"),
        description: t("admin.classesDesc"),
        route: "/(admin)/classes" as MenuRoute,
        icon: "library-outline" as keyof typeof Ionicons.glyphMap,
        color: "#16A34A",
      },
      {
        key: "assignments",
        label: t("admin.assignments"),
        description: t("admin.assignmentsDesc"),
        route: "/(admin)/assignments" as MenuRoute,
        icon: "git-network-outline" as keyof typeof Ionicons.glyphMap,
        color: "#7C3AED",
      },
      {
        key: "system",
        label: t("admin.system"),
        description: t("admin.systemDesc"),
        route: "/(admin)/system" as MenuRoute,
        icon: "settings-outline" as keyof typeof Ionicons.glyphMap,
        color: "#D97706",
      },
    ],
    [t],
  );

  const reloadDashboard = useCallback(async () => {
    await refreshAll();
    try {
      await syncClassIdsFromAssignments();
      await loadUsers();
    } catch (err) {
      console.error("Dashboard sync failed:", err);
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
    },
    [t, user?.uid],
  );

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const school =
          (await refreshSelectedSchoolFromRegistry()) ?? selectedSchool;
        await reloadDashboard();
        if (school?.id && school.name) {
          await maybeNotifySchoolPeriods(school);
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

  const isWeb = Platform.OS === "web";

  const statItems = [
    {
      key: "students",
      value: students.length,
      label: t("admin.students"),
      route: "/(admin)/user-directory/student" as DirectoryRoute,
      style: styles.statCardBlue,
    },
    {
      key: "teachers",
      value: teachers.length,
      label: t("admin.teachers"),
      route: "/(admin)/user-directory/teacher" as DirectoryRoute,
      style: styles.statCardGreen,
    },
    {
      key: "parents",
      value: parents.length,
      label: t("admin.parents"),
      route: "/(admin)/user-directory/parent" as DirectoryRoute,
      style: styles.statCardPurple,
    },
    {
      key: "classes",
      value: classes.length,
      label: t("admin.classes"),
      route: "/(admin)/class-directory" as DirectoryRoute,
      style: styles.statCardAmber,
    },
  ];

  return (
    <ErrorBoundary>
      <AdminScreenShell
        title={t("admin.dashboardTitle")}
        subtitle={t("admin.dashboardSubtitle")}
        showNotifications
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {testingRemainingDays != null ? (
            <PeriodNoticeCard
              remainingDays={testingRemainingDays}
              title={t("admin.testingPeriodNoticeTitle")}
              expiredText={t("admin.testingExpiredNotice")}
              remainingText={t("admin.usageTimeRemainingDays", {
                count: testingRemainingDays,
              })}
              hintText={t("admin.testingContactHint")}
            />
          ) : null}

          {usageRemainingDays != null ? (
            <PeriodNoticeCard
              remainingDays={usageRemainingDays}
              title={t("admin.usageSubscriptionNoticeTitle")}
              expiredText={t("admin.usageExpiredNotice")}
              remainingText={t("admin.usageTimeRemainingDays", {
                count: usageRemainingDays,
              })}
              hintText={t("admin.usageRechargeHint")}
            />
          ) : null}

          <View style={styles.statsSection}>
            {isWeb ? (
              <View style={styles.statsGridWeb}>
                {statItems.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.statCard, item.style, styles.statCardWeb]}
                    onPress={() => router.push(item.route)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.statValue}>{item.value}</Text>
                    <Text style={styles.statLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <>
                <View style={styles.statsRow}>
                  <TouchableOpacity
                    style={[styles.statCard, styles.statCardBlue]}
                    onPress={() => router.push("/(admin)/user-directory/student")}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.statValue}>{students.length}</Text>
                    <Text style={styles.statLabel}>{t("admin.students")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statCard, styles.statCardGreen]}
                    onPress={() => router.push("/(admin)/user-directory/teacher")}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.statValue}>{teachers.length}</Text>
                    <Text style={styles.statLabel}>{t("admin.teachers")}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.statsRow}>
                  <TouchableOpacity
                    style={[styles.statCard, styles.statCardPurple]}
                    onPress={() => router.push("/(admin)/user-directory/parent")}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.statValue}>{parents.length}</Text>
                    <Text style={styles.statLabel}>{t("admin.parents")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statCard, styles.statCardAmber]}
                    onPress={() => router.push("/(admin)/class-directory")}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.statValue}>{classes.length}</Text>
                    <Text style={styles.statLabel}>{t("admin.classes")}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          <View style={styles.insightsRow}>
            <TouchableOpacity
              style={styles.insightCard}
              onPress={() => router.push("/(admin)/analytics")}
            >
              <Ionicons name="bar-chart-outline" size={26} color="#2563EB" />
              <Text style={styles.insightTitle}>{t("admin.analytics")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.insightCard}
              onPress={() => router.push("/(admin)/performance")}
            >
              <Ionicons name="trending-up-outline" size={26} color="#16A34A" />
              <Text style={styles.insightTitle}>{t("admin.performance")}</Text>
            </TouchableOpacity>
          </View>

          <AdminParentsOverview />

          <Text style={styles.sectionLabel}>{t("admin.directories")}</Text>
          <Text style={styles.sectionHint}>{t("admin.directoriesHint")}</Text>

          <View style={isWeb ? styles.menuGridWeb : undefined}>
          {directoryItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuCard, isWeb && styles.menuCardWeb]}
              onPress={() => router.push(item.route)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.menuIconWrap,
                  { backgroundColor: `${item.color}18` },
                ]}
              >
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
            </TouchableOpacity>
          ))}
          </View>

          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>
            {t("admin.management")}
          </Text>

          <View style={isWeb ? styles.menuGridWeb : undefined}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuCard, isWeb && styles.menuCardWeb]}
              onPress={() => router.push(item.route)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.menuIconWrap,
                  { backgroundColor: `${item.color}18` },
                ]}
              >
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
            </TouchableOpacity>
          ))}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </AdminScreenShell>
    </ErrorBoundary>
  );
}

function PeriodNoticeCard({
  remainingDays,
  title,
  expiredText,
  remainingText,
  hintText,
}: {
  remainingDays: number;
  title: string;
  expiredText: string;
  remainingText: string;
  hintText: string;
}) {
  const isExpired = remainingDays <= 0;
  const isWarn = !isExpired && remainingDays <= 7;

  return (
    <View
      style={[
        styles.usageCard,
        isExpired ? styles.usageCardExpired : isWarn ? styles.usageCardWarn : null,
      ]}
    >
      <Ionicons
        name={
          isExpired ? "alert-circle-outline" : isWarn ? "warning-outline" : "time-outline"
        }
        size={18}
        color={isExpired ? "#B91C1C" : isWarn ? "#B45309" : "#0369A1"}
      />
      <View style={styles.usageCardText}>
        <Text style={styles.usageTitle}>{title}</Text>
        <Text style={styles.usageSub}>{isExpired ? expiredText : remainingText}</Text>
        <Text style={styles.usageHint}>{hintText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Platform.OS === "web" ? 0 : 16,
    paddingTop: Platform.OS === "web" ? 24 : 16,
    paddingBottom: Platform.OS === "web" ? 32 : 0,
  },
  usageCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  usageCardWarn: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  usageCardExpired: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  usageCardText: { flex: 1 },
  usageTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  usageSub: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  usageHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },
  statsSection: {
    marginBottom: Platform.OS === "web" ? 20 : 8,
  },
  statsGridWeb: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: Platform.OS === "web" ? 16 : 18,
    borderRadius: Platform.OS === "web" ? 12 : 18,
    ...platformShadow("sm"),
    ...(Platform.OS === "web"
      ? { borderWidth: 1, borderColor: "#E2E8F0" }
      : null),
  },
  statCardWeb: {
    flexGrow: 1,
    flexBasis: "22%",
    minWidth: 150,
    maxWidth: 220,
  },
  statCardBlue: { borderLeftWidth: 4, borderLeftColor: "#2563EB" },
  statCardGreen: { borderLeftWidth: 4, borderLeftColor: "#16A34A" },
  statCardPurple: { borderLeftWidth: 4, borderLeftColor: "#7C3AED" },
  statCardAmber: { borderLeftWidth: 4, borderLeftColor: "#D97706" },
  statValue: {
    color: "#0F172A",
    fontSize: Platform.OS === "web" ? 24 : 28,
    fontWeight: "800",
  },
  statLabel: {
    color: "#64748B",
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
  },
  insightsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: Platform.OS === "web" ? 28 : 20,
  },
  insightCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: Platform.OS === "web" ? 14 : 16,
    borderRadius: Platform.OS === "web" ? 12 : 16,
    flexDirection: Platform.OS === "web" ? "row" : "column",
    alignItems: "center",
    justifyContent: Platform.OS === "web" ? "flex-start" : "center",
    gap: Platform.OS === "web" ? 10 : 6,
    ...platformShadow("sm"),
    ...(Platform.OS === "web"
      ? { borderWidth: 1, borderColor: "#E2E8F0", minHeight: 56 }
      : null),
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: Platform.OS === "web" ? 0 : 4,
  },
  sectionHint: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 14,
    marginLeft: Platform.OS === "web" ? 0 : 4,
  },
  menuGridWeb: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 4,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: Platform.OS === "web" ? 12 : 18,
    padding: Platform.OS === "web" ? 14 : 16,
    marginBottom: Platform.OS === "web" ? 0 : 12,
    gap: 14,
    ...platformShadow("sm"),
    ...(Platform.OS === "web"
      ? { borderWidth: 1, borderColor: "#E2E8F0" }
      : null),
  },
  menuCardWeb: {
    flexGrow: 1,
    flexBasis: "48%",
    minWidth: 280,
  },
  menuIconWrap: {
    width: Platform.OS === "web" ? 44 : 48,
    height: Platform.OS === "web" ? 44 : 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  menuText: {
    flex: 1,
    minWidth: 0,
  },
  menuTitle: {
    fontSize: Platform.OS === "web" ? 15 : 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
});
