import { Alert, Platform } from "react-native";
import { getDialogBridge } from "../services/dialogBridge";

/** Multi-button Alert.alert is unreliable on web — use AppDialogHost instead. */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  cancelLabel: string,
): Promise<boolean> {
  const bridge = getDialogBridge();
  if (Platform.OS === "web" && bridge) {
    return bridge.confirm({ title, message, confirmLabel, cancelLabel });
  }

  if (Platform.OS === "web" && typeof globalThis.confirm === "function") {
    const prompt = message ? `${title}\n\n${message}` : title;
    return Promise.resolve(globalThis.confirm(prompt));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: "cancel", onPress: () => resolve(false) },
      { text: confirmLabel, onPress: () => resolve(true) },
    ]);
  });
}

export function confirmDestructiveAction(
  title: string,
  message: string,
  confirmLabel: string,
  cancelLabel: string,
): Promise<boolean> {
  const bridge = getDialogBridge();
  if (Platform.OS === "web" && bridge) {
    return bridge.confirm({
      title,
      message,
      confirmLabel,
      cancelLabel,
      destructive: true,
    });
  }

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
  const bridge = getDialogBridge();
  if (Platform.OS === "web" && bridge) {
    void bridge.alert({ title, message, variant: "success" });
    return;
  }

  showErrorAlert(title, message);
}

export function showErrorAlert(title: string, message: string): void {
  const bridge = getDialogBridge();
  if (Platform.OS === "web" && bridge) {
    void bridge.alert({ title, message, variant: "error" });
    return;
  }

  if (Platform.OS === "web" && typeof globalThis.alert === "function") {
    globalThis.alert(message ? `${title}\n\n${message}` : title);
    return;
  }

  Alert.alert(title, message);
}
