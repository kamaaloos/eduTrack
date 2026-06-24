import { getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/** Default Firebase Admin app for school Cloud Functions (Gen 2). */
export function getSchoolAdminApp(): App {
  if (getApps().length === 0) {
    return initializeApp();
  }
  try {
    return getApp();
  } catch {
    return initializeApp();
  }
}

export function getSchoolAdminDb(): Firestore {
  return getFirestore(getSchoolAdminApp());
}

export function getSchoolAdminAuth(): Auth {
  return getAuth(getSchoolAdminApp());
}
