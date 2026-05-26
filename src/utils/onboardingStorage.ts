import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@edutrack/onboarding_complete";

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === "true";
  } catch {
    return false;
  }
}

export async function markOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
}

export async function clearOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch {
    // ignore storage errors on logout
  }
}
