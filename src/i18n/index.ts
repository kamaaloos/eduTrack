import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANGUAGE } from "./languages";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import so from "./locales/so.json";
import fi from "./locales/fi.json";

export const i18nResources = {
  en: { translation: en },
  ar: { translation: ar },
  so: { translation: so },
  fi: { translation: fi },
} as const;

void i18n.use(initReactI18next).init({
  resources: i18nResources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: "en",
  compatibilityJSON: "v4",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
