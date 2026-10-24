import { Ionicons } from "@expo/vector-icons";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import { AuthContext } from "../../src/context/authContext";
import { useLanguage } from "../../src/context/languageContext";
import { useSchoolContext } from "../../src/context/schoolContext";
import { submitContactInquiry } from "../../src/services/contactInquiry";
import {
  confirmDestructiveAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";

/** In-app deletion request for signed-in users (Apple account-deletion guidance). */
export function ProfileDeleteAccountSection() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { selectedSchool } = useSchoolContext();
  const { user, userData, role } = useContext(AuthContext);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const accountEmail = (user?.email || userData?.email || "").trim();
  const displayName = (userData?.name || t("deleteAccount.requestName")).trim();
  const schoolName = selectedSchool?.name?.trim() || "";

  const handleSubmit = () => {
    void (async () => {
      if (!accountEmail) {
        showErrorAlert(t("common.error"), t("deleteAccount.errorEmail"));
        return;
      }

      const confirmed = await confirmDestructiveAction(
        t("profile.deleteAccountConfirmTitle"),
        t("profile.deleteAccountConfirmMessage"),
        t("profile.deleteAccountSubmit"),
        t("common.cancel"),
      );
      if (!confirmed) return;

      const trimmedNotes = notes.trim();
      const message = [
        t("deleteAccount.messagePrefix"),
        `${t("deleteAccount.accountEmail")}: ${accountEmail}`,
        user?.uid ? `User ID: ${user.uid}` : null,
        role ? `Role: ${role}` : null,
        schoolName ? `School: ${schoolName}` : null,
        trimmedNotes || null,
      ]
        .filter(Boolean)
        .join("\n");

      setSubmitting(true);
      try {
        await submitContactInquiry({
          name: displayName,
          email: accountEmail,
          schoolName,
          message,
          language,
        });
        setNotes("");
        showSuccessAlert(t("common.success"), t("profile.deleteAccountSuccess"));
      } catch {
        showErrorAlert(t("common.error"), t("deleteAccount.errorSubmit"));
      } finally {
        setSubmitting(false);
      }
    })();
  };

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Ionicons name="trash-outline" size={18} color="#B91C1C" />
        <Text style={styles.cardTitle}>{t("profile.deleteAccountTitle")}</Text>
      </View>
      <Text style={styles.cardHint}>{t("profile.deleteAccountHint")}</Text>

      <Text style={styles.label}>{t("deleteAccount.accountEmail")}</Text>
      <View style={styles.emailBox}>
        <Text style={styles.emailText} numberOfLines={1}>
          {accountEmail || "—"}
        </Text>
      </View>

      <Text style={styles.label}>{t("deleteAccount.notes")}</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder={t("profile.deleteAccountNotesPlaceholder")}
        placeholderTextColor="#94A3B8"
        multiline
        textAlignVertical="top"
        editable={!submitting}
      />

      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting || !accountEmail}
        accessibilityRole="button"
        accessibilityLabel={t("profile.deleteAccountSubmit")}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>
              {t("profile.deleteAccountSubmit")}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#B91C1C",
  },
  cardHint: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  emailBox: {
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    marginBottom: 12,
  },
  emailText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    marginBottom: 12,
    color: "#0F172A",
  },
  textArea: {
    minHeight: 88,
    paddingTop: 12,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#B91C1C",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
