export type SchoolFirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export type SchoolRecord = {
  id: string;
  name: string;
  active: boolean;
  firebase: SchoolFirebaseConfig;
  /** Trial/testing end date (YYYY-MM-DD). */
  testingExpiresAt?: string | null;
  /** Registered usage subscription end date (YYYY-MM-DD). */
  usageExpiresAt?: string | null;
  logoUrl?: string | null;
  country?: string | null;
  city?: string | null;
  /** Billable users — edited by super-admin or synced by registry Cloud Functions. */
  userCount?: number | null;
  userCountUpdatedAt?: string | null;
  userCountSyncError?: string | null;
};

export type StoredSchool = {
  id: string;
  name: string;
  firebase: SchoolFirebaseConfig;
  testingExpiresAt?: string | null;
  usageExpiresAt?: string | null;
};
