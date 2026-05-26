import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StoredSchool } from "../types/school";

const SELECTED_SCHOOL_KEY = "@edutrack/selected_school";

export async function getSelectedSchool(): Promise<StoredSchool | null> {
  try {
    const raw = await AsyncStorage.getItem(SELECTED_SCHOOL_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSchool;
  } catch {
    return null;
  }
}

export async function saveSelectedSchool(school: StoredSchool): Promise<void> {
  await AsyncStorage.setItem(SELECTED_SCHOOL_KEY, JSON.stringify(school));
}

export async function clearSelectedSchool(): Promise<void> {
  await AsyncStorage.removeItem(SELECTED_SCHOOL_KEY);
}
