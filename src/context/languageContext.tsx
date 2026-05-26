import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ActivityIndicator, I18nManager, StyleSheet, View } from "react-native";
import i18n from "../i18n";
import {
  APP_LANGUAGES,
  isRtlLanguage,
  type AppLanguage,
} from "../i18n/languages";
import { resolveInitialLanguage, saveLanguage } from "../utils/languageStorage";

type LanguageContextValue = {
  language: AppLanguage;
  ready: boolean;
  isRtl: boolean;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  languages: typeof APP_LANGUAGES;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** Enable RTL layouts without forceRTL (which forces a full native app restart). */
function configureRtlSupport() {
  I18nManager.allowRTL(true);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const initial = await resolveInitialLanguage();
      if (!active) return;
      configureRtlSupport();
      await i18n.changeLanguage(initial);
      setLanguageState(initial);
      setReady(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback(async (lang: AppLanguage) => {
    await saveLanguage(lang);
    configureRtlSupport();
    await i18n.changeLanguage(lang);
    setLanguageState(lang);
  }, []);

  const value = useMemo(
    () => ({
      language,
      ready,
      isRtl: isRtlLanguage(language),
      setLanguage,
      languages: APP_LANGUAGES,
    }),
    [language, ready, setLanguage],
  );

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const layoutDirection = isRtlLanguage(language) ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={value}>
      <View style={[styles.root, { direction: layoutDirection }]}>{children}</View>
    </LanguageContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
