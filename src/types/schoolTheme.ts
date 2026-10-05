/** Allowlisted font keys — map to platform faces at runtime. */
export type SchoolFontKey = "system" | "rounded" | "serif";

export type SchoolThemeConfig = {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontKey: SchoolFontKey;
};

/** Partial theme from registry or platform/appearance. */
export type SchoolThemeInput = Partial<SchoolThemeConfig>;

export const SCHOOL_FONT_KEYS: SchoolFontKey[] = ["system", "rounded", "serif"];
