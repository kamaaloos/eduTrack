import type { AppLanguage } from "../i18n/languages";
import { APP_BRAND } from "./brand";

export type WebPromoVideoSources = {
  primary: string;
  fallback: string;
};

/** Web-optimized clips bundled for native (onboarding). */
const NATIVE_EDUTRACK: Record<AppLanguage, number> = {
  en: require("../../assets/edutrack-web.mp4"),
  ar: require("../../assets/edutrack-ar-web.mp4"),
  so: require("../../assets/edutrack-web.mp4"),
  fi: require("../../assets/edutrack-web.mp4"),
};

const NATIVE_DUGSI: Record<AppLanguage, number> = {
  en: require("../../assets/dugsi-web.mp4"),
  ar: require("../../assets/dugsi-ar-web.mp4"),
  so: require("../../assets/dugsi-so-web.mp4"),
  fi: require("../../assets/dugsi-fi-web.mp4"),
};

/** Static paths under public/videos/ (see scripts/sync-web-videos.mjs). */
const WEB_EDUTRACK: Record<AppLanguage, WebPromoVideoSources> = {
  en: {
    primary: "/videos/edutrack-promo2.mp4",
    fallback: "/videos/edutrack2-web.mp4",
  },
  ar: {
    primary: "/videos/edutrack-ar-web.mp4",
    fallback: "/videos/edutrack-ar.mp4",
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

const WEB_DUGSI: Record<AppLanguage, WebPromoVideoSources> = {
  en: {
    primary: "/videos/dugsi-web.mp4",
    fallback: "/videos/dugsi.mp4",
  },
  ar: {
    primary: "/videos/dugsi-ar-web.mp4",
    fallback: "/videos/dugsi-ar.mp4",
  },
  so: {
    primary: "/videos/dugsi-so-web.mp4",
    fallback: "/videos/dugsi-so.mp4",
  },
  fi: {
    primary: "/videos/dugsi-fi-web.mp4",
    fallback: "/videos/dugsi-fi.mp4",
  },
};

export function getNativePromoVideoSource(language: AppLanguage): number {
  const map = APP_BRAND === "dugsi" ? NATIVE_DUGSI : NATIVE_EDUTRACK;
  return map[language] ?? map.en;
}

export function getWebPromoVideoSources(
  language: AppLanguage,
): WebPromoVideoSources {
  const map = APP_BRAND === "dugsi" ? WEB_DUGSI : WEB_EDUTRACK;
  return map[language] ?? map.en;
}
