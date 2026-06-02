import type { FirebaseApp } from "firebase/app";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";

export function initAuthForApp(app: FirebaseApp): Auth {
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
