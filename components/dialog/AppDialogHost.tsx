import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  registerDialogBridge,
  type AlertDialogRequest,
  type ConfirmDialogRequest,
} from "../../src/services/dialogBridge";

type PendingAlert = AlertDialogRequest & {
  resolve: () => void;
};

export function AppDialogHost() {
  const { t } = useTranslation();
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogRequest | null>(
    null,
  );
  const [alertDialog, setAlertDialog] = useState<PendingAlert | null>(null);
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    registerDialogBridge({
      confirm: (request) =>
        new Promise<boolean>((resolve) => {
          confirmResolverRef.current = resolve;
          setConfirmDialog(request);
        }),
      alert: (request) =>
        new Promise<void>((resolve) => {
          setAlertDialog({ ...request, resolve });
        }),
    });

    return () => {
      registerDialogBridge(null);
      confirmResolverRef.current = null;
    };
  }, []);

  const finishConfirm = (value: boolean) => {
    confirmResolverRef.current?.(value);
    confirmResolverRef.current = null;
    setConfirmDialog(null);
  };

  const finishAlert = () => {
    alertDialog?.resolve();
    setAlertDialog(null);
  };

  if (Platform.OS !== "web") {
    return null;
  }

  const alertVariant = alertDialog?.variant ?? "info";
  const alertIcon =
    alertVariant === "success"
      ? "checkmark-circle"
      : alertVariant === "error"
        ? "alert-circle"
        : "information-circle";
  const alertIconColor =
    alertVariant === "success"
      ? "#059669"
      : alertVariant === "error"
        ? "#DC2626"
        : "#2563EB";

  return (
    <>
      <Modal
        visible={confirmDialog != null}
        transparent
        animationType="fade"
        onRequestClose={() => finishConfirm(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdrop}
            onPress={() => finishConfirm(false)}
          />
          <View style={styles.card} accessibilityRole="alert">
            <Text style={styles.title}>{confirmDialog?.title}</Text>
            {confirmDialog?.message ? (
              <Text style={styles.message}>{confirmDialog.message}</Text>
            ) : null}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => finishConfirm(false)}
              >
                <Text style={styles.buttonSecondaryText}>
                  {confirmDialog?.cancelLabel ?? t("common.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  confirmDialog?.destructive
                    ? styles.buttonDestructive
                    : styles.buttonPrimary,
                ]}
                onPress={() => finishConfirm(true)}
              >
                <Text style={styles.buttonPrimaryText}>
                  {confirmDialog?.confirmLabel ?? t("common.confirm")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={alertDialog != null}
        transparent
        animationType="fade"
        onRequestClose={finishAlert}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={finishAlert} />
          <View style={styles.card} accessibilityRole="alert">
            <View style={styles.alertHeader}>
              <Ionicons name={alertIcon} size={22} color={alertIconColor} />
              <Text style={styles.title}>{alertDialog?.title}</Text>
            </View>
            {alertDialog?.message ? (
              <Text style={styles.message}>{alertDialog.message}</Text>
            ) : null}
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, styles.alertOkButton]}
              onPress={finishAlert}
            >
              <Text style={styles.buttonPrimaryText}>{t("common.close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    zIndex: 1,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  message: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  button: {
    minWidth: 96,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#2563EB",
  },
  buttonDestructive: {
    backgroundColor: "#DC2626",
  },
  buttonSecondary: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  buttonPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  buttonSecondaryText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 15,
  },
  alertOkButton: {
    alignSelf: "flex-end",
    marginTop: 20,
  },
});
