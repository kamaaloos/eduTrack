import { usePushNotifications } from "../hooks/usePushNotifications";

/** Registers device push token and handles notification taps. Renders nothing. */
export function PushNotificationsSetup() {
  usePushNotifications();
  return null;
}
