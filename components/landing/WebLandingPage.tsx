import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppLogo } from "../AppLogo";
import { LanguageSelector } from "../LanguageSelector";
import { AuthContext } from "../../src/context/authContext";
import { useLanguage } from "../../src/context/languageContext";
import { useSchoolContext } from "../../src/context/schoolContext";
import { useSuperAdminAuth } from "../../src/context/superAdminAuthContext";
import { getPostLoginRoute } from "../../src/utils/authNavigation";
import { hasCompletedOnboarding } from "../../src/utils/onboardingStorage";
import { safeRouterReplace } from "../../src/utils/safeNavigation";
import { WebLandingHeroVideo } from "./WebLandingHeroVideo";
import { webLandingStyles as styles } from "./webLandingStyles";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";

type FeatureItem = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  titleKey: string;
  bodyKey: string;
};

const FEATURES: FeatureItem[] = [
  {
    icon: "school-outline",
    iconBg: "#EEF2FF",
    iconColor: "#4F46E5",
    titleKey: "landing.featureStudentsTitle",
    bodyKey: "landing.featureStudentsBody",
  },
  {
    icon: "people-outline",
    iconBg: "#F5F3FF",
    iconColor: "#7C3AED",
    titleKey: "landing.featureTeachersTitle",
    bodyKey: "landing.featureTeachersBody",
  },
  {
    icon: "heart-outline",
    iconBg: "#ECFDF5",
    iconColor: "#059669",
    titleKey: "landing.featureParentsTitle",
    bodyKey: "landing.featureParentsBody",
  },
  {
    icon: "settings-outline",
    iconBg: "#FFF7ED",
    iconColor: "#EA580C",
    titleKey: "landing.featureAdminsTitle",
    bodyKey: "landing.featureAdminsBody",
  },
];

const TRUST_ROLES = [
  "landing.featureStudentsTitle",
  "landing.featureTeachersTitle",
  "landing.featureParentsTitle",
  "landing.featureAdminsTitle",
] as const;

function scrollToSection(sectionId: string) {
  if (Platform.OS !== "web") return;
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
}

export function WebLandingPage() {
  const { t } = useTranslation();
  const { language, isRtl } = useLanguage();
  const insets = useSafeAreaInsets();
  const { user, userData, role, loading } = useContext(AuthContext);
  const {
    user: superAdminUser,
    role: superAdminRole,
    loading: superAdminLoading,
  } = useSuperAdminAuth();
  const { selectedSchool, schoolReady } = useSchoolContext();

  useEffect(() => {
    if (loading || superAdminLoading || !schoolReady) return;

    if (superAdminUser && superAdminRole === "superAdmin") {
      safeRouterReplace(router, "/(super-admin)/schools");
      return;
    }

    if (user && role) {
      safeRouterReplace(router, getPostLoginRoute(role, userData));
    }
  }, [
    loading,
    superAdminLoading,
    schoolReady,
    superAdminUser,
    superAdminRole,
    user,
    role,
    userData,
  ]);

  const enterApp = useCallback(async () => {
    const complete = await hasCompletedOnboarding();
    if (!complete) {
      router.push("/onboarding");
      return;
    }
    if (!selectedSchool) {
      router.push("/select-school");
      return;
    }
    router.push("/login");
  }, [selectedSchool]);

  const goToDownload = useCallback(() => {
    router.push("/download");
  }, []);

  const layout = usePlatformLayout();
  const heroRowDirection =
    layout.isTabletWeb || layout.isDesktopWeb
      ? isRtl
        ? "row-reverse"
        : "row"
      : undefined;

  const pagePaddingStyle =
    layout.isDesktopWeb
      ? { paddingHorizontal: 40 }
      : layout.isTabletWeb
        ? { paddingHorizontal: 28 }
        : { paddingHorizontal: 20 };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        key={language}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.page, pagePaddingStyle]}>
          <View style={styles.utilityBar}>
            <View style={styles.utilityLeft}>
              <TouchableOpacity onPress={goToDownload}>
                <Text style={styles.utilityLink}>{t("landing.downloadApp")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/about")}>
                <Text style={styles.utilityLink}>{t("about.shortTitle")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/faq")}>
                <Text style={styles.utilityLink}>{t("faq.shortTitle")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/contact")}>
                <Text style={styles.utilityLink}>{t("landing.contactUs")}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.utilityRight}>
              <Text style={styles.utilityLink}>{t("landing.utilityTagline")}</Text>
            </View>
          </View>

          <View style={styles.navbar}>
            <TouchableOpacity
              style={styles.brandRow}
              onPress={() => scrollToSection("landing-top")}
              accessibilityRole="button"
            >
              <AppLogo size={52} />
              <View style={styles.brandTextWrap}>
                <Text style={styles.brandName}>{t("landing.brandName")}</Text>
                <Text style={styles.brandTag}>{t("landing.brandTag")}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.navLinks}>
              <TouchableOpacity onPress={() => scrollToSection("landing-features")}>
                <Text style={styles.navLink}>{t("landing.navFeatures")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/about")}>
                <Text style={styles.navLink}>{t("about.shortTitle")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/faq")}>
                <Text style={styles.navLink}>{t("faq.shortTitle")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/contact")}>
                <Text style={styles.navLink}>{t("landing.contactUs")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={goToDownload}>
                <Text style={styles.navLink}>{t("landing.downloadApp")}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.navActions}>
              <LanguageSelector variant="nav" compact showTitle={false} />
              <TouchableOpacity
                style={styles.navCta}
                onPress={() => void enterApp()}
                accessibilityRole="button"
              >
                <Text style={styles.navCtaText}>{t("landing.getStarted")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View nativeID="landing-top" style={styles.heroCard}>
            <View
              style={[
                styles.heroRow,
                heroRowDirection ? { flexDirection: heroRowDirection } : null,
              ]}
            >
              <View style={styles.heroCopy}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>{t("landing.heroBadge")}</Text>
                </View>

                <Text style={styles.heroTitle}>
                  {t("landing.heroTitlePrefix")}{" "}
                  <Text style={styles.heroHighlight}>
                    {t("landing.heroTitleHighlight")}
                  </Text>
                </Text>

                <Text style={styles.heroSubtitle}>{t("landing.heroSubtitle")}</Text>

                <View style={styles.heroActions}>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => void enterApp()}
                    accessibilityRole="button"
                  >
                    <Text style={styles.primaryBtnText}>
                      {t("landing.openWebApp")}
                    </Text>
                    <Ionicons
                      name={isRtl ? "arrow-back" : "arrow-forward"}
                      size={16}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={goToDownload}
                    accessibilityRole="link"
                  >
                    <Text style={styles.secondaryBtnText}>
                      {t("landing.downloadApp")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.heroMedia}>
                <WebLandingHeroVideo />
                <View style={styles.heroRating}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Ionicons
                      key={`star-${index}`}
                      name="star"
                      size={14}
                      color="#FFFFFF"
                    />
                  ))}
                  <Text style={styles.heroRatingText}>{t("landing.heroRating")}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.trustSection}>
            <Text style={styles.trustLabel}>{t("landing.trustLine")}</Text>
            <View style={styles.trustRoles}>
              {TRUST_ROLES.map((roleKey) => (
                <View key={roleKey} style={styles.trustRole}>
                  <Text style={styles.trustRoleText}>{t(roleKey)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View nativeID="landing-features" style={styles.featuresSection}>
            <View style={styles.featuresCard}>
              <Text style={styles.sectionEyebrow}>{t("landing.featuresTitle")}</Text>
              <Text style={styles.sectionTitle}>
                {t("landing.infrastructureTitle")}
              </Text>
              <Text style={styles.sectionHint}>{t("landing.featuresHint")}</Text>

              <View style={styles.featureGrid}>
                {FEATURES.map((feature) => (
                  <View key={feature.titleKey} style={styles.featureCard}>
                    <View
                      style={[
                        styles.featureIconWrap,
                        { backgroundColor: feature.iconBg },
                      ]}
                    >
                      <Ionicons
                        name={feature.icon}
                        size={22}
                        color={feature.iconColor}
                      />
                    </View>
                    <Text style={styles.featureTitle}>{t(feature.titleKey)}</Text>
                    <Text style={styles.featureBody}>{t(feature.bodyKey)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => router.push("/about")}>
                <Text style={styles.footerLink}>{t("about.shortTitle")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/faq")}>
                <Text style={styles.footerLink}>{t("faq.shortTitle")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/contact")}>
                <Text style={styles.footerLink}>{t("landing.contactUs")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => void enterApp()}>
                <Text style={styles.footerLink}>{t("landing.signIn")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={goToDownload}>
                <Text style={styles.footerLink}>{t("landing.downloadApp")}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.footerCopy}>{t("landing.copyright")}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
