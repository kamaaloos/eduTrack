import { router } from "expo-router";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../src/context/authContext";
import {
  configureForegroundNotifications,
  PUSH_NOTIFICATIONS_ENABLED,
  registerForPushNotifications,
  subscribeNotificationResponses,
  subscribePushTokenRefresh,
} from "../src/services/pushNotifications";

/** Wait for post-login navigation before requesting push permissions. */
const PUSH_REGISTER_DELAY_MS = 3000;

export function usePushNotifications() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const role = auth?.role;
  const loading = auth?.loading ?? true;
  const registeredUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!PUSH_NOTIFICATIONS_ENABLED) return;
    configureForegroundNotifications();
  }, []);

  useEffect(() => {
    if (!PUSH_NOTIFICATIONS_ENABLED) return;

    if (loading || !user?.uid) {
      registeredUserIdRef.current = null;
      return;
    }

    if (registeredUserIdRef.current === user.uid) return;

    let cancelled = false;
    let removeTokenListener: (() => void) | undefined;
    const registerTimer = setTimeout(() => {
      void registerForPushNotifications(user.uid)
        .then((token) => {
          if (cancelled || !token) return;
          registeredUserIdRef.current = user.uid;
        })
        .catch((err) => {
          console.warn("Push: registration failed after login", err);
        });

      void subscribePushTokenRefresh(user.uid, () => {
        if (!cancelled) {
          registeredUserIdRef.current = user.uid;
        }
      })
        .then((remove) => {
          if (cancelled) {
            remove();
            return;
          }
          removeTokenListener = remove;
        })
        .catch((err) => {
          console.warn("Push: token refresh listener failed", err);
        });
    }, PUSH_REGISTER_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(registerTimer);
      removeTokenListener?.();
    };
  }, [loading, user?.uid]);

  useEffect(() => {
    if (!PUSH_NOTIFICATIONS_ENABLED) return;

    let cancelled = false;
    let removeResponseListener: (() => void) | undefined;

    void subscribeNotificationResponses(role, (route) => {
      try {
        router.push(route as never);
      } catch (err) {
        console.warn("Push: notification navigation failed", err);
      }
    })
      .then((remove) => {
        if (cancelled) {
          remove();
          return;
        }
        removeResponseListener = remove;
      })
      .catch((err) => {
        console.warn("Push: response listener failed", err);
      });

    return () => {
      cancelled = true;
      removeResponseListener?.();
    };
  }, [role]);
}
