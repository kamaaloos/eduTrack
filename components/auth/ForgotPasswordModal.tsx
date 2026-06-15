import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthFormField } from "./AuthFormField";

type ForgotPasswordModalProps = {
  visible: boolean;
  email: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function ForgotPasswordModal({
  visible,
  email,
  loading,
  onEmailChange,
  onClose,
  onSubmit,
}: ForgotPasswordModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={loading ? undefined : onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>{t("auth.login.resetTitle")}</Text>
          <Text style={styles.hint}>{t("auth.login.resetHint")}</Text>

          <AuthFormField
            label={t("auth.login.email")}
            icon="person-outline"
            placeholder={t("auth.login.email")}
            value={email}
            onChangeText={onEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
            containerStyle={styles.field}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.buttonSecondaryText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                loading && styles.buttonDisabled,
              ]}
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonPrimaryText}>
                  {t("auth.login.notifyAdmin")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
    maxWidth: 440,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
  },
  field: {
    marginTop: 20,
    marginBottom: 0,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 96,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  buttonPrimary: {
    backgroundColor: "#2563EB",
  },
  buttonSecondary: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  buttonDisabled: {
    opacity: 0.65,
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
});
