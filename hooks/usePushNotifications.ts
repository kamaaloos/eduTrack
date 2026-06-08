import { router, useSegments } from "expo-router";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../src/context/authContext";
import {
  configureForegroundNotifications,
  PUSH_NOTIFICATIONS_ENABLED,
  registerForPushNotifications,
  subscribeNotificationResponses,
} from "../src/services/pushNotifications";

/** Wait until the user is on a role screen before any push native calls. */
const PUSH_SETUP_DELAY_MS = 15000;

const ROLE_ROUTE_GROUPS = new Set([
  "(students)",
  "(teachers)",
  "(parent)",
  "(admin)",
]);

function isOnRoleRoute(segments: string[]): boolean {
  const first = segments[0];
  return Boolean(first && ROLE_ROUTE_GROUPS.has(first));
}

export function usePushNotifications() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const role = auth?.role;
  const loading = auth?.loading ?? true;
  const segments = useSegments();
  const registeredUserIdRef = useRef<string | null>(null);
  const onRoleRoute = isOnRoleRoute(segments as string[]);

  useEffect(() => {
    if (!PUSH_NOTIFICATIONS_ENABLED) return;

    const timer = setTimeout(() => {
      try {
        configureForegroundNotifications();
      } catch (err) {
        console.warn("Push: configureForegroundNotifications failed", err);
      }
    }, PUSH_SETUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!PUSH_NOTIFICATIONS_ENABLED) return;
    if (loading || !user?.uid || !role || !onRoleRoute) {
      return;
    }

    if (registeredUserIdRef.current === user.uid) return;

    let cancelled = false;
    let removeResponseListener: (() => void) | undefined;

    const setupTimer = setTimeout(() => {
      void registerForPushNotifications(user.uid, { promptForPermission: false })
        .then((token) => {
          if (cancelled || !token) return;
          registeredUserIdRef.current = user.uid;
        })
        .catch((err) => {
          console.warn("Push: silent registration failed", err);
        });

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
    }, PUSH_SETUP_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(setupTimer);
      removeResponseListener?.();
    };
  }, [loading, user?.uid, role, onRoleRoute]);
}
