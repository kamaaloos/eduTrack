export type ConfirmDialogRequest = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
};

export type AlertDialogRequest = {
  title: string;
  message: string;
  variant?: "success" | "error" | "info";
};

export type DialogBridge = {
  confirm: (request: ConfirmDialogRequest) => Promise<boolean>;
  alert: (request: AlertDialogRequest) => Promise<void>;
};

let bridge: DialogBridge | null = null;

export function registerDialogBridge(next: DialogBridge | null): void {
  bridge = next;
}

export function getDialogBridge(): DialogBridge | null {
  return bridge;
}
