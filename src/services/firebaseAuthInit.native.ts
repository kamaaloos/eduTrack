import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FirebaseApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from "@firebase/auth";

export function initAuthForApp(app: FirebaseApp): Auth {
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
