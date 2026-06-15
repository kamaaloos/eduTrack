import { Platform } from "react-native";
import { clearOnboardingComplete } from "./onboardingStorage";
import {
  CHANGE_PASSWORD_ROUTE,
  getPostLoginRoute,
  getRoleHomeRoute,
  isChangePasswordSegment,
  isPublicEntrySegment,
} from "./authNavigationCore";

export {
  CHANGE_PASSWORD_ROUTE,
  getPostLoginRoute,
  getRoleHomeRoute,
  isChangePasswordSegment,
  isPublicEntrySegment,
};

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
