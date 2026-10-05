import { Platform, type TextStyle } from "react-native";
import { DEFAULT_SCHOOL_THEME } from "../constants/schoolThemeDefaults";
import type {
  SchoolFontKey,
  SchoolThemeConfig,
  SchoolThemeInput,
} from "../types/schoolTheme";
import { SCHOOL_FONT_KEYS } from "../types/schoolTheme";

const HEX_COLOR_RE = /^#([0-9A-Fa-f]{6})$/;

export function isValidThemeHex(value: string | null | undefined): boolean {
  return Boolean(value && HEX_COLOR_RE.test(value.trim()));
}

export function normalizeThemeHex(
  value: unknown,
  fallback: string,
): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!HEX_COLOR_RE.test(trimmed)) return fallback;
  return trimmed.toUpperCase();
}

export function normalizeFontKey(
  value: unknown,
  fallback: SchoolFontKey = "system",
): SchoolFontKey {
  if (typeof value !== "string") return fallback;
  const key = value.trim().toLowerCase() as SchoolFontKey;
  return SCHOOL_FONT_KEYS.includes(key) ? key : fallback;
}

export function normalizeSchoolThemeInput(
  raw: unknown,
): SchoolThemeInput | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const out: SchoolThemeInput = {};

  if (typeof data.primaryColor === "string" && isValidThemeHex(data.primaryColor)) {
    out.primaryColor = data.primaryColor.trim().toUpperCase();
  }
  if (typeof data.accentColor === "string" && isValidThemeHex(data.accentColor)) {
    out.accentColor = data.accentColor.trim().toUpperCase();
  }
  if (
    typeof data.backgroundColor === "string" &&
    isValidThemeHex(data.backgroundColor)
  ) {
    out.backgroundColor = data.backgroundColor.trim().toUpperCase();
  }
  if (typeof data.fontKey === "string") {
    out.fontKey = normalizeFontKey(data.fontKey);
  }

  return Object.keys(out).length > 0 ? out : null;
}

export function resolveSchoolTheme(
  ...layers: Array<SchoolThemeInput | null | undefined>
): SchoolThemeConfig {
  let resolved: SchoolThemeConfig = { ...DEFAULT_SCHOOL_THEME };
  for (const layer of layers) {
    if (!layer) continue;
    resolved = {
      primaryColor: normalizeThemeHex(
        layer.primaryColor,
        resolved.primaryColor,
      ),
      accentColor: normalizeThemeHex(layer.accentColor, resolved.accentColor),
      backgroundColor: normalizeThemeHex(
        layer.backgroundColor,
        resolved.backgroundColor,
      ),
      fontKey: normalizeFontKey(layer.fontKey, resolved.fontKey),
    };
  }
  return resolved;
}

/** Lighten/mix helper for web gradient mid stops. */
export function mixHex(a: string, b: string, weightTowardB: number): string {
  const parse = (hex: string) => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ] as const;
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const t = Math.min(1, Math.max(0, weightTowardB));
  const toHex = (n: number) =>
    Math.round(n).toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(ar + (br - ar) * t)}${toHex(ag + (bg - ag) * t)}${toHex(
    ab + (bb - ab) * t,
  )}`;
}

export function buildWebPageBackgroundStyle(theme: SchoolThemeConfig) {
  const mid1 = mixHex(theme.accentColor, theme.backgroundColor, 0.35);
  const mid2 = mixHex(theme.accentColor, theme.backgroundColor, 0.7);
  return {
    backgroundColor: theme.backgroundColor,
    backgroundImage: `linear-gradient(165deg, ${theme.accentColor} 0%, ${mid1} 18%, ${mid2} 42%, ${theme.backgroundColor} 58%)`,
    backgroundRepeat: "no-repeat" as const,
    backgroundSize: "cover" as const,
  };
}

export function fontFamilyForKey(fontKey: SchoolFontKey): TextStyle["fontFamily"] {
  if (fontKey === "rounded") {
    return Platform.select({
      ios: "ui-rounded",
      android: "sans-serif",
      web: "ui-rounded, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      default: undefined,
    });
  }
  if (fontKey === "serif") {
    return Platform.select({
      ios: "Georgia",
      android: "serif",
      web: "Georgia, 'Times New Roman', serif",
      default: undefined,
    });
  }
  return Platform.select({
    web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    default: undefined,
  });
}

export function themeToFirestore(theme: SchoolThemeConfig): SchoolThemeConfig {
  return {
    primaryColor: theme.primaryColor.toUpperCase(),
    accentColor: theme.accentColor.toUpperCase(),
    backgroundColor: theme.backgroundColor.toUpperCase(),
    fontKey: theme.fontKey,
  };
}

export function validateThemeInput(input: SchoolThemeInput): string | null {
  if (input.primaryColor != null && !isValidThemeHex(input.primaryColor)) {
    return "Primary color must be #RRGGBB.";
  }
  if (input.accentColor != null && !isValidThemeHex(input.accentColor)) {
    return "Accent color must be #RRGGBB.";
  }
  if (
    input.backgroundColor != null &&
    !isValidThemeHex(input.backgroundColor)
  ) {
    return "Background color must be #RRGGBB.";
  }
  if (input.fontKey != null && !SCHOOL_FONT_KEYS.includes(input.fontKey)) {
    return "Font must be system, rounded, or serif.";
  }
  return null;
}
