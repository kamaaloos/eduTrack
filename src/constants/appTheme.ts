export const APP_COPYRIGHT = "© 2026 - MayleSoft school-app by eng. Hasan Kamaal.";

/** Approximate line height of the footer copyright label. */
export const COPYRIGHT_TEXT_HEIGHT = 18;

/** Distance from the physical bottom to the copyright baseline. */
export function copyrightBarBottom(
  safeAreaBottom: number,
  bottomOffset = 0,
): number {
  return safeAreaBottom + (bottomOffset > 0 ? bottomOffset : 8);
}

/** Bottom inset so scroll/content does not cover the copyright bar. */
export function copyrightFooterInset(
  safeAreaBottom: number,
  bottomOffset = 0,
): number {
  return COPYRIGHT_TEXT_HEIGHT + copyrightBarBottom(safeAreaBottom, bottomOffset) + 4;
}

/** Latest APK builds on Expo — used on the public About screen. */
export const APP_BUILDS_URL =
  "https://expo.dev/accounts/kamaaloos/projects/eduTrack/builds";

/** Public contact form destination (also used as mailto fallback). */
export const CONTACT_EMAIL = "mayle.aden@gmail.com";

/** Screen content sits on AppScreenBackground — keep surfaces transparent. */
export const APP_SCREEN_BACKGROUND = "transparent";

/** Standard horizontal inset for native role screens (matches student dashboard). */
export const MOBILE_SCREEN_HORIZONTAL_PADDING = 16;

/** Dim overlay when side menu is open. */
export const APP_MENU_BACKDROP = "rgba(15, 23, 42, 0.45)";
