import { Platform } from "react-native";
import { clearOnboardingComplete } from "./onboardingStorage";
import { userMustChangePassword } from "./mustChangePassword";

export const CHANGE_PASSWORD_ROUTE = "/change-password";

const PUBLIC_ENTRY_SEGMENTS = new Set([
  "landing",
  "onboarding",
  "select-school",
  "login",
  "super-admin",
  "about",
  "contact",
  "download",
]);

export function isPublicEntrySegment(segment: string | undefined): boolean {
  if (!segment) return true;
  return PUBLIC_ENTRY_SEGMENTS.has(segment);
}

export function getRoleHomeRoute(role: string): string {
  switch (role) {
    case "admin":
      return "/(admin)/dashboard";
    case "teacher":
      return "/(teachers)/dashboard";
    case "student":
      return "/(students)/dashboard";
    case "parent":
      return "/(parent)/dashboard";
    default:
      return "/login";
  }
}

/** Route after sign-in: forced password change takes priority over role home. */
export function getPostLoginRoute(
  role: string,
  userData: { mustChangePassword?: boolean } | null | undefined,
): string {
  if (userMustChangePassword(userData)) {
    return CHANGE_PASSWORD_ROUTE;
  }
  return getRoleHomeRoute(role);
}

export function isChangePasswordSegment(segment: string | undefined): boolean {
  return segment === "change-password";
}

/** Route after sign-out on web (marketing entry) vs native (school picker). */
export function getPostLogoutRoute(): string {
  if (Platform.OS === "web") {
    return "/landing";
  }
  return "/select-school";
}

/** Route when a protected screen finds no signed-in school user. */
export function getSignedOutRoute(): string {
  if (Platform.OS === "web") {
    return "/landing";
  }
  return "/login";
}

/** Clears onboarding flag so the next signed-out launch starts at onboarding. */
export async function clearLocalSessionPreferences(): Promise<void> {
  await clearOnboardingComplete();
}
