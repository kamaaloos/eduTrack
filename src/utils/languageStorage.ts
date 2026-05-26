import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_LANGUAGE,
  isAppLanguage,
  LANGUAGE_STORAGE_KEY,
  type AppLanguage,
} from "../i18n/languages";

export async function getStoredLanguage(): Promise<AppLanguage | null> {
  try {
    const raw = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (raw && isAppLanguage(raw)) return raw;
  } catch {
    // ignore
  }
  return null;
}

export async function saveLanguage(lang: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

export async function resolveInitialLanguage(): Promise<AppLanguage> {
  const stored = await getStoredLanguage();
  if (stored) return stored;

  try {
    const { getLocales } = await import("expo-localization");
    const device = getLocales()[0]?.languageCode ?? "en";
    if (isAppLanguage(device)) return device;
    if (device.startsWith("ar")) return "ar";
    if (device.startsWith("so")) return "so";
    if (device.startsWith("fi")) return "fi";
  } catch {
    // expo-localization unavailable
  }

  return DEFAULT_LANGUAGE;
}
