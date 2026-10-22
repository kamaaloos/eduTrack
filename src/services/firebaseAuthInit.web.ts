import type { FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";

/**
 * Web auth must use durable persistence. `initializeAuth(app)` with no options
 * uses in-memory persistence, which signs users out on every page refresh.
 */
export function initAuthForApp(app: FirebaseApp): Auth {
  try {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
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
