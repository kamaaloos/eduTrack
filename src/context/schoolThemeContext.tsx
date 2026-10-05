import { onAuthStateChanged } from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Platform, type TextStyle, type ViewStyle } from "react-native";
import { DEFAULT_SCHOOL_THEME } from "../constants/schoolThemeDefaults";
import { auth } from "../services/firebase";
import { getSchoolAppearance } from "../services/schoolAppearance";
import type { SchoolThemeConfig, SchoolThemeInput } from "../types/schoolTheme";
import {
  buildWebPageBackgroundStyle,
  fontFamilyForKey,
  resolveSchoolTheme,
} from "../utils/schoolTheme";
import { useSchoolContext } from "./schoolContext";

export type SchoolThemeContextValue = {
  theme: SchoolThemeConfig;
  /** Registry theme only (before school override). */
  registryTheme: SchoolThemeConfig;
  webPageBackgroundStyle: ViewStyle;
  fontFamily: TextStyle["fontFamily"];
  refreshAppearance: () => Promise<void>;
};

const SchoolThemeContext = createContext<SchoolThemeContextValue | null>(null);

export function SchoolThemeProvider({ children }: { children: ReactNode }) {
  const { selectedSchool, schoolReady } = useSchoolContext();
  const [authUid, setAuthUid] = useState<string | null>(
    () => auth?.currentUser?.uid ?? null,
  );
  const [appearanceOverride, setAppearanceOverride] =
    useState<SchoolThemeInput | null>(null);

  useEffect(() => {
    if (!auth) {
      setAuthUid(null);
      return;
    }
    setAuthUid(auth.currentUser?.uid ?? null);
    return onAuthStateChanged(auth, (user) => {
      setAuthUid(user?.uid ?? null);
    });
  }, [selectedSchool?.id, schoolReady]);

  const registryTheme = useMemo(
    () => resolveSchoolTheme(selectedSchool?.theme),
    [selectedSchool?.theme],
  );

  const refreshAppearance = useCallback(async () => {
    if (
      !authUid ||
      !selectedSchool?.id ||
      selectedSchool.id === "default"
    ) {
      setAppearanceOverride(null);
      return;
    }
    const appearance = await getSchoolAppearance();
    setAppearanceOverride(appearance);
  }, [authUid, selectedSchool?.id]);

  useEffect(() => {
    if (!schoolReady || !selectedSchool?.id || !authUid) {
      setAppearanceOverride(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      const appearance = await getSchoolAppearance();
      if (!cancelled) setAppearanceOverride(appearance);
    })();

    return () => {
      cancelled = true;
    };
  }, [schoolReady, selectedSchool?.id, authUid]);

  const theme = useMemo(
    () => resolveSchoolTheme(selectedSchool?.theme, appearanceOverride),
    [selectedSchool?.theme, appearanceOverride],
  );

  const value = useMemo<SchoolThemeContextValue>(() => {
    const webPageBackgroundStyle =
      Platform.OS === "web"
        ? (buildWebPageBackgroundStyle(theme) as ViewStyle)
        : {};

    return {
      theme,
      registryTheme,
      webPageBackgroundStyle,
      fontFamily: fontFamilyForKey(theme.fontKey),
      refreshAppearance,
    };
  }, [theme, registryTheme, refreshAppearance]);

  return (
    <SchoolThemeContext.Provider value={value}>
      {children}
    </SchoolThemeContext.Provider>
  );
}

export function useSchoolTheme(): SchoolThemeContextValue {
  const ctx = useContext(SchoolThemeContext);
  if (!ctx) {
    const theme = DEFAULT_SCHOOL_THEME;
    return {
      theme,
      registryTheme: theme,
      webPageBackgroundStyle:
        Platform.OS === "web"
          ? (buildWebPageBackgroundStyle(theme) as ViewStyle)
          : {},
      fontFamily: fontFamilyForKey(theme.fontKey),
      refreshAppearance: async () => undefined,
    };
  }
  return ctx;
}
