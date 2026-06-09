import { Platform, type ViewStyle } from "react-native";

type ShadowSize = "sm" | "md" | "lg";

const WEB: Record<ShadowSize, ViewStyle> = {
  sm: { boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)" },
  md: { boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)" },
  lg: { boxShadow: "0 4px 14px rgba(15, 23, 42, 0.12)" },
};

const NATIVE: Record<ShadowSize, ViewStyle> = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
};

/** Use instead of shadow* on web to avoid RN Web deprecation warnings. */
export function platformShadow(size: ShadowSize = "sm"): ViewStyle {
  return Platform.OS === "web" ? WEB[size] : NATIVE[size];
}

/** Side drawer / panel cast to the right on native; same on web. */
export function platformShadowDrawer(): ViewStyle {
  return Platform.OS === "web"
    ? { boxShadow: "4px 0 24px rgba(15, 23, 42, 0.18)" }
    : {
        shadowColor: "#0F172A",
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 12,
      };
}

/** Accent-colored glow (e.g. schedule “now” card). */
export function platformShadowAccent(color: string): ViewStyle {
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return Platform.OS === "web"
    ? { boxShadow: `0 2px 8px rgba(${r}, ${g}, ${b}, 0.35)` }
    : {
        shadowColor: color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
      };
}
