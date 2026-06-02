import { Alert, Platform } from "react-native";

/** Multi-button Alert.alert is unreliable on web — use window.confirm instead. */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  cancelLabel: string,
): Promise<boolean> {
  if (Platform.OS === "web") {
    if (typeof globalThis.confirm === "function") {
      const prompt = message ? `${title}\n\n${message}` : title;
      return Promise.resolve(globalThis.confirm(prompt));
    }
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: "cancel", onPress: () => resolve(false) },
      { text: confirmLabel, onPress: () => resolve(true) },
    ]);
  });
}

/** @deprecated Use confirmAction — kept for logout flows */
export function confirmDestructiveAction(
  title: string,
  message: string,
  confirmLabel: string,
  cancelLabel: string,
): Promise<boolean> {
  if (Platform.OS === "web") {
    return confirmAction(title, message, confirmLabel, cancelLabel);
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: "cancel", onPress: () => resolve(false) },
      { text: confirmLabel, style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

export function showSuccessAlert(title: string, message: string): void {
  showErrorAlert(title, message);
}

export function showErrorAlert(title: string, message: string): void {
  if (Platform.OS === "web" && typeof globalThis.alert === "function") {
    globalThis.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
