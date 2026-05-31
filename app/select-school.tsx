import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppScreenBackground } from "../components/AppScreenBackground";
import { useSuperAdminAuth } from "../src/context/superAdminAuthContext";
import { useSchoolContext } from "../src/context/schoolContext";
import type { SchoolRecord } from "../src/types/school";
import { clearLocalSessionPreferences } from "../src/utils/authNavigation";

const PLATFORM_ADMIN_LINK_VISIBLE =
  process.env.EXPO_PUBLIC_SHOW_PLATFORM_ADMIN_LINK === "true";
const PLATFORM_ADMIN_LOGO_TAPS = 5;
const PLATFORM_ADMIN_TAP_WINDOW_MS = 2500;

export default function SelectSchoolScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    schools,
    schoolsLoading,
    connecting,
    error,
    selectSchool,
    reloadSchools,
  } = useSchoolContext();
  const { user: superAdminUser, role: superAdminRole, logout: superAdminLogout } =
    useSuperAdminAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectError, setSelectError] = useState<string | null>(null);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const logoTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openPlatformAdminLogin = () => {
    router.push("/super-admin/login");
  };

  const handleLogoPress = () => {
    if (PLATFORM_ADMIN_LINK_VISIBLE) return;

    const nextCount = logoTapCount + 1;
    if (logoTapTimerRef.current) {
      clearTimeout(logoTapTimerRef.current);
    }

    if (nextCount >= PLATFORM_ADMIN_LOGO_TAPS) {
      setLogoTapCount(0);
      openPlatformAdminLogin();
      return;
    }

    setLogoTapCount(nextCount);
    logoTapTimerRef.current = setTimeout(() => {
      setLogoTapCount(0);
    }, PLATFORM_ADMIN_TAP_WINDOW_MS);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await reloadSchools();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelect = async (school: SchoolRecord) => {
    setSelectError(null);
    try {
      await selectSchool(school);
      router.replace("/login");
    } catch (err) {
      setSelectError(
        err instanceof Error ? err.message : t("selectSchool.connectError"),
      );
    }
  };

  const handleBackToOnboarding = async () => {
    await clearLocalSessionPreferences();
    router.replace("/onboarding");
  };

  const handleSuperAdminLogout = () => {
    Alert.alert(t("superAdmin.signOutTitle"), t("superAdmin.signOutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await superAdminLogout();
          } catch (err) {
            Alert.alert(
              t("common.error"),
              err instanceof Error
                ? err.message
                : t("superAdmin.signOutFailed"),
            );
          }
        },
      },
    ]);
  };

  return (
    <AppScreenBackground>
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Pressable
          style={styles.logo}
          onPress={handleLogoPress}
          accessibilityRole="image"
          accessibilityLabel={t("selectSchool.title")}
        >
          <Text style={styles.logoText}>🎓</Text>
        </Pressable>
        <Text style={styles.title}>{t("selectSchool.title")}</Text>
        <Text style={styles.subtitle}>{t("selectSchool.subtitle")}</Text>
        <TouchableOpacity
          style={styles.secondaryLink}
          onPress={() => void handleBackToOnboarding()}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={16} color="#475569" />
          <Text style={styles.secondaryLinkText}>
            {t("selectSchool.backToOnboarding")}
          </Text>
        </TouchableOpacity>
        {superAdminUser && superAdminRole === "superAdmin" ? (
          <TouchableOpacity
            style={styles.secondaryLink}
            onPress={handleSuperAdminLogout}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={16} color="#475569" />
            <Text style={styles.secondaryLinkText}>
              {t("selectSchool.signOutPlatformAdmin")}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {(error || selectError) && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{selectError || error}</Text>
        </View>
      )}

      {schoolsLoading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>{t("selectSchool.loading")}</Text>
        </View>
      ) : (
        <FlatList
          data={schools}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Math.max(insets.bottom, 20) + 16 },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="school-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyText}>{t("selectSchool.empty")}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.schoolCard}
              onPress={() => void handleSelect(item)}
              disabled={connecting}
              activeOpacity={0.85}
            >
              {item.logoUrl ? (
                <Image source={{ uri: item.logoUrl }} style={styles.schoolLogo} />
              ) : (
                <View style={styles.schoolIcon}>
                  <Ionicons name="business" size={24} color="#1E3A8A" />
                </View>
              )}
              <View style={styles.schoolInfo}>
                <Text style={styles.schoolName}>{item.name}</Text>
                {item.city ? (
                  <Text style={styles.schoolMeta}>{item.city}</Text>
                ) : (
                  <Text style={styles.schoolMeta}>{t("common.continue")}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        />
      )}

      {connecting ? (
        <View style={styles.connectingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.connectingText}>{t("common.loading")}</Text>
        </View>
      ) : null}

      {PLATFORM_ADMIN_LINK_VISIBLE ? (
        <TouchableOpacity
          style={[styles.adminLink, { bottom: Math.max(insets.bottom, 16) + 16 }]}
          onPress={openPlatformAdminLogin}
        >
          <Ionicons name="planet-outline" size={18} color="#1E3A8A" />
          <Text style={styles.adminLinkText}>{t("selectSchool.superAdminLink")}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
    </AppScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: "center",
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E3A8A",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
  },
  secondaryLink: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },
  secondaryLinkText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
  errorBox: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 14,
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  schoolCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 14,
  },
  schoolIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  schoolLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
  },
  schoolInfo: {
    flex: 1,
    minWidth: 0,
  },
  schoolName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  schoolMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#64748B",
    fontSize: 15,
  },
  emptyCard: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },
  connectingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  connectingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  adminLink: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  adminLinkText: {
    color: "#1E3A8A",
    fontSize: 14,
    fontWeight: "700",
  },
});
