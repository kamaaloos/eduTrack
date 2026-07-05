import type { AppLanguage } from "../i18n/languages";
import type { WebPromoVideoSources } from "./promoVideos.types";

const nativePromoVideos: Record<AppLanguage, number> = {
  en: require("../../assets/dugsi-web.mp4"),
  ar: require("../../assets/dugsi-ar-web.mp4"),
  so: require("../../assets/dugsi-so-web.mp4"),
  fi: require("../../assets/dugsi-fi-web.mp4"),
};

const webPromoVideos: Record<AppLanguage, WebPromoVideoSources> = {
  en: {
    primary: "/videos/dugsi-web.mp4",
    fallback: "/videos/dugsi-web.mp4",
  },
  ar: {
    primary: "/videos/dugsi-ar-web.mp4",
    fallback: "/videos/dugsi-ar-web.mp4",
  },
  so: {
    primary: "/videos/dugsi-so-web.mp4",
    fallback: "/videos/dugsi-so-web.mp4",
  },
  fi: {
    primary: "/videos/dugsi-fi-web.mp4",
    fallback: "/videos/dugsi-fi-web.mp4",
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
