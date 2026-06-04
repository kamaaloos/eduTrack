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

export function usePushNotifications() {
  const { user, role, loading } = useContext(AuthContext);
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

    void registerForPushNotifications(user.uid).then((token) => {
      if (cancelled || !token) return;
      registeredUserIdRef.current = user.uid;
    });

    void subscribePushTokenRefresh(user.uid, () => {
      if (!cancelled) {
        registeredUserIdRef.current = user.uid;
      }
    }).then((remove) => {
      if (cancelled) {
        remove();
        return;
      }
      removeTokenListener = remove;
    });

    return () => {
      cancelled = true;
      removeTokenListener?.();
    };
  }, [loading, user?.uid]);

  useEffect(() => {
    if (!PUSH_NOTIFICATIONS_ENABLED) return;

    let cancelled = false;
    let removeResponseListener: (() => void) | undefined;

    void subscribeNotificationResponses(role, (route) => {
      router.push(route as never);
    }).then((remove) => {
      if (cancelled) {
        remove();
        return;
      }
      removeResponseListener = remove;
    });

    return () => {
      cancelled = true;
      removeResponseListener?.();
    };
  }, [role]);
}
