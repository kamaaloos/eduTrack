import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { AdminScreenHeader } from "../../components/admin/AdminScreenHeader";
import { AuthContext } from "../../src/context/authContext";
import { useAdminData } from "../../src/context/adminDataContext";
import { useSchoolContext } from "../../src/context/schoolContext";
import { useUnreadNotificationCount } from "../../hooks/useNotifications";
import { notifySchoolUsageExpiring } from "../../src/services/notificationEvents";
import { getUsageRemainingDays } from "../../src/utils/usageExpiry";

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
  const notificationCount = useUnreadNotificationCount(user?.uid);

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

  const maybeNotifyUsageExpiring = useCallback(
    async (school: { id: string; name: string; usageExpiresAt?: string | null }) => {
      const remaining = getUsageRemainingDays(school.usageExpiresAt);
      if (remaining == null || remaining > 7) return;

      await notifySchoolUsageExpiring({
        schoolId: school.id,
        schoolName: school.name,
        remainingDays: remaining,
        actorId: user?.uid ?? null,
      });
    },
    [user?.uid],
  );

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const school =
          (await refreshSelectedSchoolFromRegistry()) ?? selectedSchool;
        await reloadDashboard();
        if (school?.id && school.name) {
          await maybeNotifyUsageExpiring(school);
        }
      })();
    }, [
      reloadDashboard,
      maybeNotifyUsageExpiring,
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

  return (
    <ErrorBoundary>
      <View style={styles.screen}>
        <AdminScreenHeader
          title={t("admin.dashboardTitle")}
          subtitle={t("admin.dashboardSubtitle")}
          notificationCount={notificationCount}
          onNotificationsPress={() =>
            router.push("/(admin)/notifications" as never)
          }
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {usageRemainingDays != null ? (
            <View
              style={[
                styles.usageCard,
                usageRemainingDays <= 7 ? styles.usageCardWarn : null,
              ]}
            >
              <Ionicons
                name={usageRemainingDays <= 7 ? "warning-outline" : "time-outline"}
                size={18}
                color={usageRemainingDays <= 7 ? "#B45309" : "#0369A1"}
              />
              <View style={styles.usageCardText}>
                <Text style={styles.usageTitle}>{t("admin.usageTimeNoticeTitle")}</Text>
                <Text style={styles.usageSub}>
                  {usageRemainingDays <= 0
                    ? t("admin.usageExpiredNotice")
                    : t("admin.usageTimeRemainingDays", { count: usageRemainingDays })}
                </Text>
                <Text style={styles.usageHint}>{t("admin.usageRechargeHint")}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.statsSection}>
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

          <Text style={styles.sectionLabel}>{t("admin.directories")}</Text>
          <Text style={styles.sectionHint}>{t("admin.directoriesHint")}</Text>

          {directoryItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuCard}
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

          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>
            {t("admin.management")}
          </Text>

          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuCard}
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

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardBlue: { borderLeftWidth: 4, borderLeftColor: "#2563EB" },
  statCardGreen: { borderLeftWidth: 4, borderLeftColor: "#16A34A" },
  statCardPurple: { borderLeftWidth: 4, borderLeftColor: "#7C3AED" },
  statCardAmber: { borderLeftWidth: 4, borderLeftColor: "#D97706" },
  statValue: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "800",
  },
  statLabel: {
    color: "#64748B",
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
  },
  insightsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  insightCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  menuIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  menuText: {
    flex: 1,
    minWidth: 0,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
});
