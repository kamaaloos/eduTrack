export type AppLanguage = "en" | "ar" | "so" | "fi";

export const APP_LANGUAGES: {
  code: AppLanguage;
  labelKey: string;
  nativeName: string;
}[] = [
  { code: "en", labelKey: "language.english", nativeName: "English" },
  { code: "ar", labelKey: "language.arabic", nativeName: "العربية" },
  { code: "so", labelKey: "language.somali", nativeName: "Soomaali" },
  { code: "fi", labelKey: "language.finnish", nativeName: "Suomi" },
];

export const DEFAULT_LANGUAGE: AppLanguage = "en";
export const LANGUAGE_STORAGE_KEY = "appLanguage";

export function isAppLanguage(value: string): value is AppLanguage {
  return value === "en" || value === "ar" || value === "so" || value === "fi";
}

export function isRtlLanguage(lang: AppLanguage): boolean {
  return lang === "ar";
}
