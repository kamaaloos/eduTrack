import { DEFAULT_SCHOOL_THEME } from "../src/constants/schoolThemeDefaults";
import {
  isValidThemeHex,
  normalizeSchoolThemeInput,
  resolveSchoolTheme,
  validateThemeInput,
} from "../src/utils/schoolTheme";

describe("schoolTheme utils", () => {
  it("validates #RRGGBB hex", () => {
    expect(isValidThemeHex("#1E3A8A")).toBe(true);
    expect(isValidThemeHex("#abc")).toBe(false);
    expect(isValidThemeHex("blue")).toBe(false);
  });

  it("normalizes partial theme input", () => {
    expect(
      normalizeSchoolThemeInput({
        primaryColor: "#14532d",
        fontKey: "serif",
        junk: true,
      }),
    ).toEqual({
      primaryColor: "#14532D",
      fontKey: "serif",
    });
  });

  it("resolves layers over defaults", () => {
    const theme = resolveSchoolTheme(
      { primaryColor: "#14532D" },
      { accentColor: "#4ADE80", fontKey: "rounded" },
    );
    expect(theme.primaryColor).toBe("#14532D");
    expect(theme.accentColor).toBe("#4ADE80");
    expect(theme.backgroundColor).toBe(DEFAULT_SCHOOL_THEME.backgroundColor);
    expect(theme.fontKey).toBe("rounded");
  });

  it("rejects invalid theme fields", () => {
    expect(validateThemeInput({ primaryColor: "red" })).toMatch(/Primary/i);
    expect(validateThemeInput({ fontKey: "comic" as never })).toMatch(/Font/i);
    expect(validateThemeInput({ primaryColor: "#112233" })).toBeNull();
  });
});
