import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { deleteApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  getReactNativePersistence,
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, terminate, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import type { SchoolFirebaseConfig } from "../types/school";
import { normalizeSchoolFirebaseConfig } from "../utils/firebaseConfig";
import { notifyFirestoreClosing } from "./firestoreSession";

type EnvFirebaseConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

function configFromEnv(prefix: string): EnvFirebaseConfig {
  return {
    apiKey: process.env[`${prefix}_API_KEY`],
    authDomain: process.env[`${prefix}_AUTH_DOMAIN`],
    projectId: process.env[`${prefix}_PROJECT_ID`],
    storageBucket: process.env[`${prefix}_STORAGE_BUCKET`],
    messagingSenderId: process.env[`${prefix}_MESSAGING_SENDER_ID`],
    appId: process.env[`${prefix}_APP_ID`],
  };
}

function hasValidConfig(
  config: EnvFirebaseConfig | SchoolFirebaseConfig | null | undefined,
): config is SchoolFirebaseConfig {
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

type RegistryFirebase = {
  db: Firestore;
  auth: Auth;
};

let lastSchoolFirebaseConfig: SchoolFirebaseConfig | null = null;

function initAuthForApp(app: ReturnType<typeof initializeApp>): Auth {
  if (Platform.OS === "web") {
    try {
      return initializeAuth(app);
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        err.code === "auth/already-initialized"
      ) {
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
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "auth/already-initialized"
    ) {
      return getAuth(app);
    }
    throw err;
  }
}

function initAdminCreateAuth(app: ReturnType<typeof initializeApp>): Auth {
  try {
    return initializeAuth(app, {
      persistence: inMemoryPersistence,
    });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "auth/already-initialized"
    ) {
      return getAuth(app);
    }
    throw err;
  }
}

function createRegistryFirebase(): RegistryFirebase | null {
  if (!hasValidConfig(effectiveRegistryConfig)) {
    return null;
  }

  try {
    const app = initializeApp(
      effectiveRegistryConfig as SchoolFirebaseConfig,
      "EduTrackRegistry",
    );
    return {
      db: getFirestore(app),
      auth: initAuthForApp(app),
    };
  } catch (err) {
    console.error("Registry Firebase init failed:", err);
    return null;
  }
}

const registryFirebase = createRegistryFirebase();

export const registryDb = registryFirebase?.db ?? null;
export const registryAuth = registryFirebase?.auth ?? null;

export function isRegistryFirebaseReady(): boolean {
  return registryDb !== null && registryAuth !== null;
}

export function isFirebaseConfigured(): boolean {
  return isRegistryFirebaseReady() || hasValidConfig(defaultConfig);
}

export let auth: Auth | null = null;
export let db: Firestore | null = null;
export let storage: FirebaseStorage | null = null;
export let adminCreateAuth: Auth | null = null;

let connectedSchoolProjectId: string | null = null;

async function shutdownFirebaseApp(
  app: ReturnType<typeof initializeApp>,
): Promise<void> {
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
 */
export function ensureAdminCreateAuth(): Auth | null {
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

export async function connectToSchool(
  firebaseConfig: SchoolFirebaseConfig,
): Promise<{ auth: Auth; db: Firestore }> {
  const config = normalizeSchoolFirebaseConfig(firebaseConfig);
  const projectId = config.projectId;
  if (!hasValidConfig(config)) {
    throw new Error("Invalid school Firebase configuration");
  }

  if (connectedSchoolProjectId === projectId && auth && db) {
    try {
      const schoolApp = getApp(`EduTrackSchool-${projectId}`);
      if (!storage) {
        const bucket = config.storageBucket.trim();
        storage = bucket ? getStorage(schoolApp, bucket) : getStorage(schoolApp);
      }
    } catch {
      /* fall through to full reconnect */
    }
    if (storage) {
      return { auth, db };
    }
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
    schoolApp = initializeApp(config, schoolAppName);
  }

  lastSchoolFirebaseConfig = config;
  auth = initAuthForApp(schoolApp);
  db = getFirestore(schoolApp);
  const bucket = config.storageBucket.trim();
  storage = bucket ? getStorage(schoolApp, bucket) : getStorage(schoolApp);
  adminCreateAuth = null;

  connectedSchoolProjectId = projectId;
  return { auth, db };
}

export function getDefaultFirebaseConfig(): EnvFirebaseConfig {
  return defaultConfig;
}

export function getConnectedSchoolProjectId(): string | null {
  return connectedSchoolProjectId;
}

export async function disconnectSchool(): Promise<void> {
  notifyFirestoreClosing();

  auth = null;
  db = null;
  storage = null;
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
