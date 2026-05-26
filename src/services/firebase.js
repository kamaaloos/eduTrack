import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  getReactNativePersistence,
  getAuth,
  initializeAuth,
  inMemoryPersistence,
} from "firebase/auth";
import { getFirestore, terminate } from "firebase/firestore";
import { notifyFirestoreClosing } from "./firestoreSession";

/** @typedef {import('../types/school').SchoolFirebaseConfig} SchoolFirebaseConfig */

function configFromEnv(prefix) {
  return {
    apiKey: process.env[`${prefix}_API_KEY`],
    authDomain: process.env[`${prefix}_AUTH_DOMAIN`],
    projectId: process.env[`${prefix}_PROJECT_ID`],
    storageBucket: process.env[`${prefix}_STORAGE_BUCKET`],
    messagingSenderId: process.env[`${prefix}_MESSAGING_SENDER_ID`],
    appId: process.env[`${prefix}_APP_ID`],
  };
}

function hasValidConfig(config) {
  return Boolean(config?.apiKey && config?.projectId);
}

const registryConfig = configFromEnv("EXPO_PUBLIC_REGISTRY");
const defaultConfig = configFromEnv("EXPO_PUBLIC_FIREBASE");
const effectiveRegistryConfig = hasValidConfig(registryConfig)
  ? registryConfig
  : defaultConfig;

if (!hasValidConfig(effectiveRegistryConfig)) {
  console.error(
    "Firebase registry config missing. Set EXPO_PUBLIC_REGISTRY_* or EXPO_PUBLIC_FIREBASE_* in .env",
  );
}

/** School + admin secondary apps use this config for lazy admin-auth init. */
/** @type {SchoolFirebaseConfig | null} */
let lastSchoolFirebaseConfig = null;

function initAuthForApp(app) {
  if (Platform.OS === "web") {
    try {
      return initializeAuth(app);
    } catch (err) {
      if (err?.code === "auth/already-initialized") {
        return getAuth(app);
      }
      throw err;
    }
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (err) {
    if (err?.code === "auth/already-initialized") {
      return getAuth(app);
    }
    throw err;
  }
}

function initAdminCreateAuth(app) {
  try {
    return initializeAuth(app, {
      persistence: inMemoryPersistence,
    });
  } catch (err) {
    if (err?.code === "auth/already-initialized") {
      return getAuth(app);
    }
    throw err;
  }
}

const registryApp = initializeApp(effectiveRegistryConfig, "EduTrackRegistry");
export const registryDb = getFirestore(registryApp);
export const registryAuth = initAuthForApp(registryApp);

/** @type {import('firebase/auth').Auth | null} */
export let auth = null;

/** @type {import('firebase/firestore').Firestore | null} */
export let db = null;

/** @type {import('firebase/auth').Auth | null} */
export let adminCreateAuth = null;

let connectedSchoolProjectId = null;

async function shutdownFirebaseApp(app) {
  try {
    await terminate(getFirestore(app));
  } catch {
    // Firestore may already be terminated or never started.
  }
  try {
    await deleteApp(app);
  } catch {
    // App may already be deleted.
  }
}

/**
 * Secondary Auth used only when admins create/import users (in-memory session).
 * Lazily initialized so login/school connect does not trigger RN persistence warnings.
 */
export function ensureAdminCreateAuth() {
  if (!lastSchoolFirebaseConfig || !connectedSchoolProjectId) {
    return null;
  }

  if (adminCreateAuth) {
    return adminCreateAuth;
  }

  const projectId = connectedSchoolProjectId;
  const adminAppName = `AdminUserCreation-${projectId}`;
  let adminApp;
  try {
    adminApp = getApp(adminAppName);
  } catch {
    adminApp = initializeApp(lastSchoolFirebaseConfig, adminAppName);
  }

  adminCreateAuth = initAdminCreateAuth(adminApp);
  return adminCreateAuth;
}

/**
 * Connect the app to a school's Firebase project (Auth + Firestore).
 * @param {SchoolFirebaseConfig} firebaseConfig
 */
export async function connectToSchool(firebaseConfig) {
  const projectId = firebaseConfig?.projectId;
  if (!hasValidConfig(firebaseConfig)) {
    throw new Error("Invalid school Firebase configuration");
  }

  if (connectedSchoolProjectId === projectId && auth && db) {
    return { auth, db };
  }

  notifyFirestoreClosing();

  for (const existing of getApps()) {
    if (
      existing.name.startsWith("EduTrackSchool-") &&
      existing.name !== `EduTrackSchool-${projectId}`
    ) {
      await shutdownFirebaseApp(existing);
    }
    if (
      existing.name.startsWith("AdminUserCreation-") &&
      existing.name !== `AdminUserCreation-${projectId}`
    ) {
      await shutdownFirebaseApp(existing);
    }
  }

  const schoolAppName = `EduTrackSchool-${projectId}`;
  let schoolApp;
  try {
    schoolApp = getApp(schoolAppName);
  } catch {
    schoolApp = initializeApp(firebaseConfig, schoolAppName);
  }

  lastSchoolFirebaseConfig = firebaseConfig;
  auth = initAuthForApp(schoolApp);
  db = getFirestore(schoolApp);
  adminCreateAuth = null;

  connectedSchoolProjectId = projectId;
  return { auth, db };
}

export function getDefaultFirebaseConfig() {
  return defaultConfig;
}

export function getConnectedSchoolProjectId() {
  return connectedSchoolProjectId;
}

export async function disconnectSchool() {
  notifyFirestoreClosing();

  auth = null;
  db = null;
  adminCreateAuth = null;
  lastSchoolFirebaseConfig = null;
  connectedSchoolProjectId = null;

  for (const existing of getApps()) {
    if (
      existing.name.startsWith("EduTrackSchool-") ||
      existing.name.startsWith("AdminUserCreation-")
    ) {
      await shutdownFirebaseApp(existing);
    }
  }
}
