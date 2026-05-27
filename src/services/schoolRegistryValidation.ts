import type { SchoolFirebaseConfig } from "../types/school";
import { validateUsageExpiryDate } from "../utils/validation";

export type SchoolRegistryInput = {
  name: string;
  city?: string;
  active: boolean;
  usageExpiresAt: string;
  firebase: SchoolFirebaseConfig;
};

export function validateSchoolInput(input: SchoolRegistryInput): string | null {
  if (!input.name.trim()) return "School name is required.";
  if (!input.usageExpiresAt.trim()) return "Usage expiry date is required.";
  if (!validateUsageExpiryDate(input.usageExpiresAt)) {
    return "Usage expiry date must be YYYY-MM-DD.";
  }
  if (!input.firebase.apiKey.trim()) return "Firebase API key is required.";
  if (!input.firebase.projectId.trim()) return "Firebase project ID is required.";
  if (!input.firebase.authDomain.trim()) return "Firebase auth domain is required.";
  if (!input.firebase.appId.trim()) return "Firebase app ID is required.";
  return null;
}
