import { createElement, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import { useLanguage } from "../../src/context/languageContext";
import { webLandingStyles as styles } from "./webLandingStyles";

const PROMO_VIDEO_EN = require("../../assets/edutrack.mp4");
const PROMO_VIDEO_AR = require("../../assets/edutrack-ar.mp4");

function resolveVideoSrc(source: unknown): string | number {
  if (typeof source === "string" || typeof source === "number") {
    return source;
  }
  return (source as { default?: string }).default ?? String(source);
}

export function WebLandingHeroVideo() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const videoSrc = useMemo(
    () =>
      resolveVideoSrc(language === "ar" ? PROMO_VIDEO_AR : PROMO_VIDEO_EN),
    [language],
  );

  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <View style={styles.heroVideoWrap}>
      {createElement("video", {
        key: String(videoSrc),
        src: videoSrc,
        autoPlay: true,
        muted: true,
        loop: true,
        playsInline: true,
        controls: true,
        preload: "metadata",
        "aria-label": t("landing.promoVideoAria"),
        style: {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          backgroundColor: "#0F172A",
        },
      })}
    </View>
  );
}
