import { useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { PushNotificationsSetup } from "./PushNotificationsSetup";

const ROLE_ROUTE_GROUPS = new Set([
  "(students)",
  "(teachers)",
  "(parent)",
  "(admin)",
]);

/** Mount push hooks only after the user has been on a role screen for a while. */
const DEFER_MS = 20000;

function isOnRoleRoute(segments: string[]): boolean {
  const first = segments[0];
  return Boolean(first && ROLE_ROUTE_GROUPS.has(first));
}

export function DeferredPushNotificationsSetup() {
  const segments = useSegments();
  const onRoleRoute = isOnRoleRoute(segments as string[]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!onRoleRoute) {
      setReady(false);
      return;
    }

    const timer = setTimeout(() => setReady(true), DEFER_MS);
    return () => {
      clearTimeout(timer);
      setReady(false);
    };
  }, [onRoleRoute]);

  if (!ready) return null;
  return <PushNotificationsSetup />;
}
