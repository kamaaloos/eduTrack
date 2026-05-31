import type { SchoolFirebaseConfig } from "../types/school";
import { validateUsageExpiryDate } from "../utils/validation";

export type SchoolRegistryInput = {
  name: string;
  city?: string;
  logoUrl?: string;
  active: boolean;
  usageExpiresAt: string;
  /** Optional billable user count; null clears the field. */
  userCount: number | null;
  firebase: SchoolFirebaseConfig;
};

export function parseOptionalUserCount(value: string): number | null | undefined {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
    return undefined;
  }
  return parsed;
}

export function validateSchoolInput(input: SchoolRegistryInput): string | null {
  if (!input.name.trim()) return "School name is required.";
  if (!input.usageExpiresAt.trim()) return "Usage expiry date is required.";
  if (!validateUsageExpiryDate(input.usageExpiresAt)) {
    return "Usage expiry date must be YYYY-MM-DD.";
  }
  if (
    input.userCount != null &&
    (!Number.isInteger(input.userCount) || input.userCount < 0)
  ) {
    return "Billable user count must be a whole number 0 or greater.";
  }
  if (input.logoUrl?.trim() && !/^https?:\/\//i.test(input.logoUrl.trim())) {
    return "School logo URL must start with http:// or https://.";
  }
  if (!input.firebase.apiKey.trim()) return "Firebase API key is required.";
  if (!input.firebase.projectId.trim()) return "Firebase project ID is required.";
  if (!input.firebase.authDomain.trim()) return "Firebase auth domain is required.";
  if (!input.firebase.appId.trim()) return "Firebase app ID is required.";
  return null;
}
