import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppScreenBackground } from "../components/AppScreenBackground";
import { OnboardingWelcomeVideo } from "../components/onboarding/OnboardingWelcomeVideo";
import { WebPageCard } from "../components/layout/WebPageCard";
import { LanguageSelector } from "../components/LanguageSelector";
import { useLanguage } from "../src/context/languageContext";
import { platformShadowAccent } from "../src/utils/platformShadow";
import { webAuthContentStyle } from "../src/constants/webLayout";
import { markOnboardingComplete } from "../src/utils/onboardingStorage";

type LanguageSlide = {
  id: "language";
  type: "language";
};

type ContentSlide = {
  id: string;
  type: "content";
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  description: string;
};

type Slide = LanguageSlide | ContentSlide;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { isRtl, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;

  const slides = useMemo<Slide[]>(
    () => [
      { id: "language", type: "language" },
      {
        id: "welcome",
        type: "content",
        icon: "school",
        iconBg: "#DBEAFE",
        title: t("onboarding.slide1Title"),
        description: t("onboarding.slide1Desc"),
      },
      {
        id: "students",
        type: "content",
        icon: "people",
        iconBg: "#E0E7FF",
        title: t("onboarding.slide2Title"),
        description: t("onboarding.slide2Desc"),
      },
      {
        id: "teachers",
        type: "content",
        icon: "clipboard",
        iconBg: "#EDE9FE",
        title: t("onboarding.slide3Title"),
        description: t("onboarding.slide3Desc"),
      },
      {
        id: "start",
        type: "content",
        icon: "rocket",
        iconBg: "#DCFCE7",
        title: t("onboarding.slide4Title"),
        description: t("onboarding.slide4Desc"),
      },
    ],
    [t],
  );

  const currentSlide = slides[activeIndex];
  const isLanguageSlide = currentSlide?.type === "language";
  const isLastSlide = activeIndex === slides.length - 1;
  const showSkip = activeIndex > 0 && !isLastSlide;

  useEffect(() => {
    fade.setValue(0);
    slideX.setValue(isRtl ? -16 : 16);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideX, {
        toValue: 0,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeIndex, fade, isRtl, slideX]);

  const finishOnboarding = async () => {
    try {
      await markOnboardingComplete();
    } catch (err) {
      console.warn("onboarding storage:", err);
    }
    router.replace("/select-school");
  };

  const goNext = () => {
    if (activeIndex >= slides.length - 1) {
      void finishOnboarding();
      return;
    }
    setActiveIndex((index) => index + 1);
  };

  const Frame = AppScreenBackground;
  const frameProps = { showCopyright: false };

  const nextIcon = isLastSlide
    ? "log-in-outline"
    : isRtl
      ? "arrow-back"
      : "arrow-forward";

  return (
    <Frame {...frameProps}>
      <View style={styles.screen}>
        <StatusBar style="dark" />

        {showSkip ? (
          <Pressable
            style={[
              styles.skipButton,
              isRtl ? styles.skipButtonRtl : styles.skipButtonLtr,
              { top: insets.top + 8 },
            ]}
            onPress={() => void finishOnboarding()}
            accessibilityLabel={t("onboarding.skipA11y")}
          >
            <Text style={styles.skipText}>{t("common.skip")}</Text>
          </Pressable>
        ) : (
          <View
            style={[
              styles.skipPlaceholder,
              isRtl ? styles.skipButtonRtl : styles.skipButtonLtr,
              { top: insets.top + 8 },
            ]}
          />
        )}

        <View style={[styles.onboardingColumn, webAuthContentStyle()]}>
          <WebPageCard fill style={styles.onboardingCard}>
        <View style={styles.body}>
          {Platform.OS !== "web" ? (
            <OnboardingWelcomeVideo
              key={language}
              visible={currentSlide?.id === "welcome"}
            />
          ) : null}

          <Animated.View
            style={[
              styles.slide,
              {
                opacity: fade,
                transform: [{ translateX: slideX }],
              },
            ]}
          >
            {currentSlide?.type === "language" ? (
              <>
                <View style={[styles.iconCircle, styles.languageIconCircle]}>
                  <Ionicons name="language" size={52} color="#1E3A8A" />
                </View>
                <Text style={[styles.title, isRtl && styles.titleRtl]}>
                  {t("language.choose")}
                </Text>
                <Text style={[styles.languageHint, isRtl && styles.textRtl]}>
                  {t("onboarding.languageHint")}
                </Text>
                <LanguageSelector compact showTitle={false} />
              </>
            ) : currentSlide?.type === "content" ? (
              <>
                {currentSlide.id !== "welcome" ? (
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: currentSlide.iconBg },
                    ]}
                  >
                    <Ionicons name={currentSlide.icon} size={52} color="#1E3A8A" />
                  </View>
                ) : null}
                <Text style={[styles.title, isRtl && styles.titleRtl]}>
                  {currentSlide.title}
                </Text>
                <Text style={[styles.description, isRtl && styles.textRtl]}>
                  {currentSlide.description}
                </Text>
              </>
            ) : null}
          </Animated.View>
        </View>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 16) + 8 },
          ]}
        >
          <View style={styles.dots}>
            {slides.map((slide, index) => (
              <View
                key={slide.id}
                style={[styles.dot, index === activeIndex && styles.dotActive]}
              />
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              isRtl && styles.primaryButtonRtl,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={goNext}
          >
            <Text style={styles.primaryButtonText}>
              {isLastSlide
                ? t("onboarding.getStarted")
                : isLanguageSlide
                  ? t("onboarding.continue")
                  : t("onboarding.next")}
            </Text>
            <Ionicons name={nextIcon} size={20} color="#FFFFFF" />
          </Pressable>
        </View>
          </WebPageCard>
        </View>
      </View>
    </Frame>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  skipButton: {
    position: "absolute",
    zIndex: 2,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  skipButtonLtr: {
    right: 20,
  },
  skipButtonRtl: {
    left: 20,
  },
  skipPlaceholder: {
    position: "absolute",
    height: 36,
    width: 72,
  },
  skipText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
  onboardingColumn: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  onboardingCard: {
    flex: 1,
    justifyContent: "space-between",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    width: "100%",
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  languageIconCircle: {
    backgroundColor: "#E0F2FE",
  },
  languageHint: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
    maxWidth: 320,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 34,
    maxWidth: 340,
  },
  titleRtl: {
    writingDirection: "rtl",
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: "#475569",
    textAlign: "center",
    maxWidth: 340,
  },
  textRtl: {
    writingDirection: "rtl",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    width: "100%",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
  },
  dotActive: {
    width: 22,
    backgroundColor: "#1E3A8A",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    gap: 8,
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#1E3A8A",
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 24,
    ...platformShadowAccent("#1E3A8A"),
  },
  primaryButtonRtl: {
    flexDirection: "row-reverse",
  },
  primaryButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
