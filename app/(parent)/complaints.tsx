import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ParentScreenShell } from "../../components/parent/ParentScreenShell";
import { AuthContext } from "../../src/context/authContext";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import { submitParentComplaint } from "../../src/services/parentComplaints";
import { showErrorAlert, showSuccessAlert } from "../../src/utils/confirmDialog";

const isWeb = Platform.OS === "web";

export default function ParentComplaintsScreen() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const parentName = useMemo(
    () =>
      userData?.name?.trim() ||
      user?.displayName?.trim() ||
      user?.email?.trim() ||
      t("common.parent"),
    [t, user?.displayName, user?.email, userData?.name],
  );

  const handleSubmit = async () => {
    if (!user?.uid) {
      showErrorAlert(t("common.error"), t("common.sessionExpired"));
      return;
    }

    if (!subject.trim()) {
      showErrorAlert(t("common.error"), t("parent.complaintSubjectRequired"));
      return;
    }

    if (message.trim().length < 10) {
      showErrorAlert(t("common.error"), t("parent.complaintMessageTooShort"));
      return;
    }

    setSubmitting(true);
    try {
      await submitParentComplaint({
        parentId: user.uid,
        parentName,
        subject: subject.trim(),
        message: message.trim(),
      });
      showSuccessAlert(t("common.success"), t("parent.complaintSuccess"));
      setSubject("");
      setMessage("");
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("parent.complaintError"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ParentScreenShell
      title={t("parent.complaintsTitle")}
      subtitle={t("parent.complaintsSubtitle")}
      showBack
      showMenu={false}
      showNotifications={false}
      scroll={false}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.label}>{t("parent.complaintSubject")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("parent.complaintSubjectPlaceholder")}
              value={subject}
              onChangeText={setSubject}
              maxLength={80}
            />

            <Text style={[styles.label, styles.messageLabel]}>
              {t("parent.complaintMessage")}
            </Text>
            <TextInput
              style={styles.messageInput}
              placeholder={t("parent.complaintMessagePlaceholder")}
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitDisabled]}
              onPress={() => void handleSubmit()}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>{t("parent.complaintSubmit")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ParentScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingBottom: 32,
    alignItems: isWeb ? "center" : "stretch",
  },
  card: {
    width: "100%",
    maxWidth: isWeb ? 560 : undefined,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    padding: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  input: {
    marginTop: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
    ...(Platform.OS === "web" ? ({ boxSizing: "border-box" } as object) : null),
  },
  messageLabel: {
    marginTop: 18,
  },
  messageInput: {
    marginTop: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    padding: 14,
    minHeight: 130,
    fontSize: 15,
    color: "#0F172A",
    ...(Platform.OS === "web" ? ({ boxSizing: "border-box" } as object) : null),
  },
  submitBtn: {
    marginTop: 20,
    backgroundColor: "#1E40AF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});
