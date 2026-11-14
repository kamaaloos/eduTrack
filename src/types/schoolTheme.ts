/** Allowlisted font keys — map to platform faces at runtime. */
export type SchoolFontKey = "system" | "rounded" | "serif";

/** Section heading scale (Announcements, Schedule, Homework, Exams, …). */
export type SchoolHeadingSizeKey = "sm" | "md" | "lg";

export type SchoolThemeConfig = {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontKey: SchoolFontKey;
  headingSize: SchoolHeadingSizeKey;
};

/** Partial theme from registry or platform/appearance. */
export type SchoolThemeInput = Partial<SchoolThemeConfig>;

export const SCHOOL_FONT_KEYS: SchoolFontKey[] = ["system", "rounded", "serif"];

export const SCHOOL_HEADING_SIZE_KEYS: SchoolHeadingSizeKey[] = [
  "sm",
  "md",
  "lg",
];
