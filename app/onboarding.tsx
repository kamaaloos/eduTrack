import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppScreenBackground } from "../components/AppScreenBackground";
import { LanguageSelector } from "../components/LanguageSelector";
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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
    listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < slides.length) {
      setActiveIndex(index);
    }
  };

  const isLanguageSlide = slides[activeIndex]?.type === "language";
  const isLastSlide = activeIndex === slides.length - 1;
  const showSkip = activeIndex > 0 && !isLastSlide;

  return (
    <AppScreenBackground>
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {showSkip ? (
        <TouchableOpacity
          style={[styles.skipButton, { top: insets.top + 8 }]}
          onPress={() => void finishOnboarding()}
          accessibilityLabel={t("onboarding.skipA11y")}
        >
          <Text style={styles.skipText}>{t("common.skip")}</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.skipPlaceholder, { top: insets.top + 8 }]} />
      )}

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            {item.type === "language" ? (
              <>
                <View style={[styles.iconCircle, styles.languageIconCircle]}>
                  <Ionicons name="language" size={56} color="#1E3A8A" />
                </View>
                <Text style={styles.languageHint}>
                  English · العربية · Soomaali · Suomi
                </Text>
                <LanguageSelector compact showTitle={false} />
              </>
            ) : (
              <>
                <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={56} color="#1E3A8A" />
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </>
            )}
          </View>
        )}
      />

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 20) + 40 },
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

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={goNext}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>
            {isLastSlide
              ? t("onboarding.getStarted")
              : isLanguageSlide
                ? t("onboarding.continue")
                : t("onboarding.next")}
          </Text>
          <Ionicons
            name={isLastSlide ? "log-in-outline" : "arrow-forward"}
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>

      </View>
    </View>
    </AppScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  skipButton: {
    position: "absolute",
    right: 20,
    zIndex: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipPlaceholder: {
    position: "absolute",
    right: 20,
    height: 36,
  },
  skipText: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "600",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  languageIconCircle: {
    backgroundColor: "#E0F2FE",
    marginBottom: 20,
  },
  languageHint: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#475569",
    textAlign: "center",
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#1E3A8A",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1E3A8A",
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
