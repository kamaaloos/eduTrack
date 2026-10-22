import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  registerDialogBridge,
  type AlertDialogRequest,
  type ConfirmDialogRequest,
} from "../../src/services/dialogBridge";
import { platformShadow } from "../../src/utils/platformShadow";
import { SchoolThemeButton } from "../common/SchoolThemeButton";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";

type PendingAlert = AlertDialogRequest & {
  resolve: () => void;
};

export function AppDialogHost() {
  const { t } = useTranslation();
  const { theme, fontFamily } = useSchoolTheme();
  const primary = theme.primaryColor;
  const accent = theme.accentColor;
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogRequest | null>(
    null,
  );
  const [alertDialog, setAlertDialog] = useState<PendingAlert | null>(null);
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);

  useEffect(() => {
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

  const alertVariant = alertDialog?.variant ?? "info";
  const alertIcon =
    alertVariant === "success"
      ? "checkmark-circle"
      : alertVariant === "error"
        ? "alert-circle"
        : "information-circle";
  const alertTone =
    alertVariant === "success"
      ? "#059669"
      : alertVariant === "error"
        ? "#DC2626"
        : primary;

  const confirmIsDestructive = Boolean(confirmDialog?.destructive);
  const confirmIcon = confirmIsDestructive
    ? "warning"
    : "help-circle";
  const confirmTone = confirmIsDestructive ? "#DC2626" : primary;

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
            <View
              style={[
                styles.accentBar,
                { backgroundColor: confirmIsDestructive ? "#DC2626" : primary },
              ]}
            />
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: confirmIsDestructive
                    ? "#FEE2E2"
                    : `${primary}18`,
                },
              ]}
            >
              <Ionicons name={confirmIcon} size={28} color={confirmTone} />
            </View>
            <Text
              style={[styles.title, fontFamily ? { fontFamily } : null]}
            >
              {confirmDialog?.title}
            </Text>
            {confirmDialog?.message ? (
              <Text style={styles.message}>{confirmDialog.message}</Text>
            ) : null}
            <View style={styles.actions}>
              <Pressable
                onPress={() => finishConfirm(false)}
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonSecondary,
                  { borderColor: `${primary}33` },
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text style={[styles.buttonSecondaryText, { color: primary }]}>
                  {confirmDialog?.cancelLabel ?? t("common.cancel")}
                </Text>
              </Pressable>
              {confirmIsDestructive ? (
                <Pressable
                  onPress={() => finishConfirm(true)}
                  style={({ pressed }) => [
                    styles.button,
                    styles.buttonDestructive,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Text style={styles.buttonPrimaryText}>
                    {confirmDialog?.confirmLabel ?? t("common.confirm")}
                  </Text>
                </Pressable>
              ) : (
                <SchoolThemeButton
                  size="compact"
                  label={confirmDialog?.confirmLabel ?? t("common.confirm")}
                  onPress={() => finishConfirm(true)}
                  style={styles.confirmPrimary}
                  textStyle={styles.buttonPrimaryText}
                />
              )}
            </View>
            <View
              style={[styles.softGlow, { backgroundColor: accent }]}
              pointerEvents="none"
            />
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
            <View
              style={[styles.accentBar, { backgroundColor: alertTone }]}
            />
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: `${alertTone}18` },
              ]}
            >
              <Ionicons name={alertIcon} size={28} color={alertTone} />
            </View>
            <Text
              style={[styles.title, fontFamily ? { fontFamily } : null]}
            >
              {alertDialog?.title}
            </Text>
            {alertDialog?.message ? (
              <Text style={styles.message}>{alertDialog.message}</Text>
            ) : null}
            <SchoolThemeButton
              size="compact"
              label={t("common.close")}
              onPress={finishAlert}
              style={styles.alertOkButton}
              textStyle={styles.buttonPrimaryText}
            />
            <View
              style={[
                styles.softGlow,
                { backgroundColor: accent },
              ]}
              pointerEvents="none"
            />
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
    backgroundColor: "rgba(15, 23, 42, 0.52)",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: "#E8EEF5",
    overflow: "hidden",
    ...platformShadow("xl"),
    zIndex: 1,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  softGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    right: -40,
    bottom: -50,
    opacity: 0.08,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 26,
  },
  message: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 22,
  },
  button: {
    minWidth: 104,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDestructive: {
    backgroundColor: "#DC2626",
  },
  buttonSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
  },
  confirmPrimary: {
    minWidth: 104,
  },
  buttonPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  buttonSecondaryText: {
    fontWeight: "700",
    fontSize: 15,
  },
  alertOkButton: {
    alignSelf: "flex-end",
    marginTop: 22,
    minWidth: 104,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
