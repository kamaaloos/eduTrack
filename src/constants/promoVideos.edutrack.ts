import type { AppLanguage } from "../i18n/languages";
import type { WebPromoVideoSources } from "./promoVideos.types";

const nativePromoVideos: Record<AppLanguage, number> = {
  en: require("../../assets/edutrack-web.mp4"),
  ar: require("../../assets/edutrack-ar-web.mp4"),
  so: require("../../assets/edutrack-web.mp4"),
  fi: require("../../assets/edutrack-web.mp4"),
};

const webPromoVideos: Record<AppLanguage, WebPromoVideoSources> = {
  en: {
    primary: "/videos/edutrack-promo2.mp4",
    fallback: "/videos/edutrack2-web.mp4",
  },
  ar: {
    primary: "/videos/edutrack-ar-web.mp4",
    fallback: "/videos/edutrack-ar-web.mp4",
  },
  so: {
    primary: "/videos/edutrack-promo2.mp4",
    fallback: "/videos/edutrack2-web.mp4",
  },
  fi: {
    primary: "/videos/edutrack-promo2.mp4",
    fallback: "/videos/edutrack2-web.mp4",
  },
};

export function getNativePromoVideoSource(language: AppLanguage): number {
  return nativePromoVideos[language] ?? nativePromoVideos.en;
}

export function getWebPromoVideoSources(
  language: AppLanguage,
): WebPromoVideoSources {
  return webPromoVideos[language] ?? webPromoVideos.en;
}
