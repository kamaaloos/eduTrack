import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { parseTempPasswordQrData } from "../../src/utils/tempPasswordCard";
import { showErrorAlert } from "../../src/utils/confirmDialog";

type LoginCardCodeModalProps = {
  visible: boolean;
  onClose: () => void;
  onFilled: (payload: { email: string; password: string; name?: string }) => void;
};

export function LoginCardCodeModal({
  visible,
  onClose,
  onFilled,
}: LoginCardCodeModalProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");

  const handleClose = () => {
    setCode("");
    onClose();
  };

  const handleSubmit = () => {
    const payload = parseTempPasswordQrData(code);
    if (!payload) {
      showErrorAlert(t("common.error"), t("auth.login.enterCardCodeInvalid"));
      return;
    }

    onFilled({
      email: payload.email,
      password: payload.password,
      name: payload.name,
    });
    setCode("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.card}>
          <Text style={styles.title}>{t("auth.login.enterCardCodeTitle")}</Text>
          <Text style={styles.hint}>{t("auth.login.enterCardCodeHint")}</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder={t("auth.login.enterCardCodePlaceholder")}
            placeholderTextColor="#94A3B8"
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            textAlignVertical="top"
          />
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleClose}
            >
              <Text style={styles.buttonSecondaryText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonPrimaryText}>
                {t("auth.login.enterCardCodeSubmit")}
              </Text>
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
    maxWidth: 480,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },
  input: {
    marginTop: 14,
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 96,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#2563EB",
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
});
