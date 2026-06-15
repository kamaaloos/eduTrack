import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppScreenBackground } from "../components/AppScreenBackground";
import { WebPageCard } from "../components/layout/WebPageCard";
import { AppLogo } from "../components/AppLogo";
import { AuthAboutLink } from "../components/auth/AuthAboutLink";
import { SelectSchoolLocationPicker } from "../components/auth/SelectSchoolLocationPicker";
import { useSuperAdminAuth } from "../src/context/superAdminAuthContext";
import { useSchoolContext } from "../src/context/schoolContext";
import type { SchoolRecord } from "../src/types/school";
import { clearLocalSessionPreferences } from "../src/utils/authNavigation";
import { webAuthContentStyle } from "../src/constants/webLayout";
import {
  confirmDestructiveAction,
  showErrorAlert,
} from "../src/utils/confirmDialog";

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
    void (async () => {
      const confirmed = await confirmDestructiveAction(
        t("superAdmin.signOutTitle"),
        t("superAdmin.signOutConfirm"),
        t("common.logout"),
        t("common.cancel"),
      );
      if (!confirmed) return;

      try {
        await superAdminLogout();
      } catch (err) {
        showErrorAlert(
          t("common.error"),
          err instanceof Error ? err.message : t("superAdmin.signOutFailed"),
        );
      }
    })();
  };

  const isWeb = Platform.OS === "web";
  const Frame = AppScreenBackground;
  const frameProps = { showCopyright: false };
  const contentColumn = webAuthContentStyle();

  const pickerBody =
    schools.length > 0 ? (
      <SelectSchoolLocationPicker
        schools={schools}
        connecting={connecting}
        onSelectSchool={(school) => void handleSelect(school)}
      />
    ) : null;

  const scrollContentStyle = [
    isWeb ? styles.webScroll : styles.nativeScroll,
    contentColumn,
    {
      paddingTop: insets.top + (isWeb ? 20 : 56),
      paddingBottom: Math.max(insets.bottom, 24) + 24,
    },
  ];

  const topActions = (
    <View style={styles.topActionsRowInner}>
      <TouchableOpacity
        style={styles.topActionLink}
        onPress={() => void handleBackToOnboarding()}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t("selectSchool.backToOnboarding")}
      >
        <Ionicons name="arrow-back" size={16} color="#1E3A8A" />
        <Text style={styles.topActionLinkText}>
          {t("selectSchool.backToOnboarding")}
        </Text>
      </TouchableOpacity>
      <AuthAboutLink />
    </View>
  );

  return (
    <Frame {...frameProps}>
    <View style={[styles.screen, isWeb && styles.screenWeb]}>
      <StatusBar style="dark" />
      {!isWeb ? (
        <View
          style={[
            styles.topActionsRow,
            {
              top: insets.top + 8,
              paddingHorizontal: 16,
            },
          ]}
        >
          {topActions}
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <WebPageCard>
        {isWeb ? (
          <View style={styles.cardTopActions}>{topActions}</View>
        ) : null}
        <View style={styles.header}>
          <Pressable
            style={styles.logo}
            onPress={handleLogoPress}
            accessibilityRole="image"
            accessibilityLabel={t("selectSchool.title")}
          >
            <AppLogo size={88} />
          </Pressable>
          <Text style={styles.title}>{t("selectSchool.title")}</Text>
          <Text style={styles.subtitle}>{t("selectSchool.subtitle")}</Text>
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

        {(error || selectError) ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{selectError || error}</Text>
          </View>
        ) : null}

        {schoolsLoading && !refreshing ? (
          <View style={styles.centeredInline}>
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text style={styles.loadingText}>{t("selectSchool.loading")}</Text>
          </View>
        ) : schools.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="school-outline" size={40} color="#94A3B8" />
            <Text style={styles.emptyText}>{t("selectSchool.empty")}</Text>
          </View>
        ) : (
          <View style={styles.list}>{pickerBody}</View>
        )}
        </WebPageCard>
      </ScrollView>

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
    </Frame>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  webScroll: {
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  nativeScroll: {
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: 24,
  },
  topActionsRowInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
  },
  cardTopActions: {
    marginBottom: 12,
  },
  topActionsRow: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topActionLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.85)",
    flexShrink: 1,
    maxWidth: "58%",
  },
  topActionLinkText: {
    color: "#1E3A8A",
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: "center",
  },
  logo: {
    marginBottom: 16,
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
  centeredInline: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 32,
  },
  errorBox: {
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
    paddingTop: 8,
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
