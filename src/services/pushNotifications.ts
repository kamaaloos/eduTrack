import Constants from "expo-constants";
import { Platform } from "react-native";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { notificationsRouteForRole } from "../utils/pushNotificationRoutes";

export { notificationsRouteForRole } from "../utils/pushNotificationRoutes";

type NotificationsModule = typeof import("expo-notifications");

function isExpoGo(): boolean {
  return (
    Constants.executionEnvironment === "storeClient" ||
    Constants.appOwnership === "expo"
  );
}

/** Native builds only — not web and not Expo Go (SDK 53+ removed remote push from Go). */
export const PUSH_NOTIFICATIONS_ENABLED =
  Platform.OS !== "web" && !isExpoGo();

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (!PUSH_NOTIFICATIONS_ENABLED) return null;
  try {
    return await import("expo-notifications");
  } catch (err) {
    console.warn("Push: expo-notifications unavailable", err);
    return null;
  }
}

async function loadDeviceModule(): Promise<typeof import("expo-device") | null> {
  if (!PUSH_NOTIFICATIONS_ENABLED) return null;
  try {
    return await import("expo-device");
  } catch {
    return null;
  }
}

export function configureForegroundNotifications(): void {
  if (!PUSH_NOTIFICATIONS_ENABLED) return;

  void loadNotifications().then((Notifications) => {
    if (!Notifications) return;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  });
}

async function ensureAndroidChannel(
  Notifications: NotificationsModule,
): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#1E3A8A",
    sound: "default",
  });
}

function getExpoProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    undefined
  );
}

export async function requestPushPermissions(): Promise<boolean> {
  if (!PUSH_NOTIFICATIONS_ENABLED) return false;

  try {
    const Notifications = await loadNotifications();
    if (!Notifications) return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === "granted") return true;

    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    return status === "granted";
  } catch (err) {
    console.warn("Push: requestPushPermissions failed", err);
    return false;
  }
}

export async function hasPushPermissions(): Promise<boolean> {
  if (!PUSH_NOTIFICATIONS_ENABLED) return false;

  try {
    const Notifications = await loadNotifications();
    if (!Notifications) return false;
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

export async function getDevicePushToken(): Promise<string | null> {
  if (!PUSH_NOTIFICATIONS_ENABLED) return null;

  try {
    const [Notifications, Device] = await Promise.all([
      loadNotifications(),
      loadDeviceModule(),
    ]);
    if (!Notifications || !Device?.isDevice) return null;

    const projectId = getExpoProjectId();
    if (!projectId) {
      console.warn("Push: missing EAS projectId in app config");
      return null;
    }

    await ensureAndroidChannel(Notifications);

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (err) {
    console.warn("Push: getDevicePushToken failed", err);
    return null;
  }
}

export async function savePushTokenToProfile(
  userId: string,
  token: string,
): Promise<void> {
  if (!db || !userId || !token) return;

  await updateDoc(doc(db, "users", userId), {
    expoPushToken: token,
    pushTokenUpdatedAt: serverTimestamp(),
    pushPlatform: Platform.OS,
  });
}

export async function clearPushTokenFromProfile(userId: string): Promise<void> {
  if (!db || !userId) return;

  try {
    await updateDoc(doc(db, "users", userId), {
      expoPushToken: null,
      pushTokenUpdatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("clearPushTokenFromProfile:", err);
  }
}

export async function registerForPushNotifications(
  userId: string,
  options?: { promptForPermission?: boolean },
): Promise<string | null> {
  if (!PUSH_NOTIFICATIONS_ENABLED || !userId) return null;

  try {
    const Device = await loadDeviceModule();
    if (!Device?.isDevice) return null;

    const granted = options?.promptForPermission
      ? await requestPushPermissions()
      : await hasPushPermissions();
    if (!granted) return null;

    const token = await getDevicePushToken();
    if (!token) return null;

    await savePushTokenToProfile(userId, token);
    return token;
  } catch (err) {
    console.warn("Push: registerForPushNotifications failed", err);
    return null;
  }
}

export async function subscribePushTokenRefresh(
  userId: string,
  onRegistered: () => void,
): Promise<() => void> {
  if (!PUSH_NOTIFICATIONS_ENABLED) return () => {};

  const Notifications = await loadNotifications();
  if (!Notifications) return () => {};

  const subscription = Notifications.addPushTokenListener(() => {
    void registerForPushNotifications(userId, { promptForPermission: false }).then(
      (token) => {
        if (token) onRegistered();
      },
    );
  });

  return () => subscription.remove();
}

export async function subscribeNotificationResponses(
  role: string | null | undefined,
  navigate: (route: string) => void,
): Promise<() => void> {
  if (!PUSH_NOTIFICATIONS_ENABLED) return () => {};

  const Notifications = await loadNotifications();
  if (!Notifications) return () => {};

  const route = notificationsRouteForRole(role);
  if (!route) return () => {};

  const openFromResponse = (
    response: import("expo-notifications").NotificationResponse | null,
  ) => {
    if (!response) return;
    navigate(route);
  };

  const subscription =
    Notifications.addNotificationResponseReceivedListener(openFromResponse);

  return () => subscription.remove();
}
