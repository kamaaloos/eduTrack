import type { Timestamp } from "firebase/firestore";
import type { SchoolFirebaseConfig, SchoolRecord } from "../types/school";

export function normalizeFirebaseConfig(
  raw: unknown,
): SchoolFirebaseConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const config: SchoolFirebaseConfig = {
    apiKey: String(data.apiKey ?? "").trim(),
    authDomain: String(data.authDomain ?? "").trim(),
    projectId: String(data.projectId ?? "").trim(),
    storageBucket: String(data.storageBucket ?? "").trim(),
    messagingSenderId: String(data.messagingSenderId ?? "").trim(),
    appId: String(data.appId ?? "").trim(),
  };
  if (!config.apiKey || !config.projectId) return null;
  return config;
}

/** Registry `usageExpiresAt` as YYYY-MM-DD (string or Firestore Timestamp). */
export function normalizeUsageExpiresAt(raw: unknown): string | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed || null;
  }
  if (typeof raw === "object" && raw !== null && "toDate" in raw) {
    const date = (raw as Timestamp).toDate();
    return date.toISOString().slice(0, 10);
  }
  return null;
}

/** Registry timestamp fields as ISO strings (Firestore Timestamp or string). */
export function normalizeRegistryTimestamp(raw: unknown): string | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed || null;
  }
  if (typeof raw === "object" && raw !== null && "toDate" in raw) {
    return (raw as Timestamp).toDate().toISOString();
  }
  return null;
}

export function mapSchoolRegistryDoc(
  id: string,
  data: Record<string, unknown>,
): SchoolRecord | null {
  const firebase = normalizeFirebaseConfig(data.firebase);
  if (!firebase) return null;
  return {
    id,
    name: String(data.name ?? "School"),
    active: data.active !== false,
    firebase,
    usageExpiresAt: normalizeUsageExpiresAt(data.usageExpiresAt),
    logoUrl:
      typeof data.logoUrl === "string" && data.logoUrl.trim()
        ? data.logoUrl.trim()
        : null,
    city: data.city ? String(data.city) : null,
    userCount:
      typeof data.userCount === "number" && Number.isFinite(data.userCount)
        ? data.userCount
        : null,
    userCountUpdatedAt: normalizeRegistryTimestamp(data.userCountUpdatedAt),
    userCountSyncError:
      typeof data.userCountSyncError === "string" && data.userCountSyncError.trim()
        ? data.userCountSyncError.trim()
        : null,
  };
}
