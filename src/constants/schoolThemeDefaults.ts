import type { SchoolThemeConfig } from "../types/schoolTheme";

/** Matches current global eduTrack palette. */
export const DEFAULT_SCHOOL_THEME: SchoolThemeConfig = {
  primaryColor: "#1E3A8A",
  accentColor: "#6B9FD4",
  backgroundColor: "#E8F2FA",
  fontKey: "system",
};

export const SCHOOL_THEME_PRESETS: Array<{
  id: string;
  labelKey: string;
  theme: SchoolThemeConfig;
}> = [
  {
    id: "navy",
    labelKey: "schoolTheme.presetNavy",
    theme: { ...DEFAULT_SCHOOL_THEME },
  },
  {
    id: "forest",
    labelKey: "schoolTheme.presetForest",
    theme: {
      primaryColor: "#14532D",
      accentColor: "#4ADE80",
      backgroundColor: "#ECFDF5",
      fontKey: "system",
    },
  },
  {
    id: "burgundy",
    labelKey: "schoolTheme.presetBurgundy",
    theme: {
      primaryColor: "#7F1D1D",
      accentColor: "#F87171",
      backgroundColor: "#FEF2F2",
      fontKey: "system",
    },
  },
  {
    id: "slate",
    labelKey: "schoolTheme.presetSlate",
    theme: {
      primaryColor: "#334155",
      accentColor: "#94A3B8",
      backgroundColor: "#F1F5F9",
      fontKey: "rounded",
    },
  },
];
