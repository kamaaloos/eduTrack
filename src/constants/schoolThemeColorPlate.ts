import { SCHOOL_THEME_PRESETS } from "./schoolThemeDefaults";

/** Curated plate colors for school appearance pickers. */
export const SCHOOL_THEME_COLOR_PLATE: string[] = [
  "#0F172A",
  "#1E3A8A",
  "#1D4ED8",
  "#0369A1",
  "#0E7490",
  "#14532D",
  "#15803D",
  "#4D7C0F",
  "#A16207",
  "#B45309",
  "#C2410C",
  "#7F1D1D",
  "#9F1239",
  "#9D174D",
  "#6B21A8",
  "#5B21B6",
  "#334155",
  "#475569",
  "#64748B",
  "#94A3B8",
  "#6B9FD4",
  "#4ADE80",
  "#F87171",
  "#FBBF24",
  "#E8F2FA",
  "#ECFDF5",
  "#FEF2F2",
  "#F1F5F9",
  "#FFFFFF",
  "#F8FAFC",
];

/** Unique colors already used by named theme presets. */
export function schoolThemePresetPlateColors(): string[] {
  const seen = new Set<string>();
  const colors: string[] = [];
  for (const preset of SCHOOL_THEME_PRESETS) {
    for (const hex of [
      preset.theme.primaryColor,
      preset.theme.accentColor,
      preset.theme.backgroundColor,
    ]) {
      const key = hex.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      colors.push(key);
    }
  }
  return colors;
}
