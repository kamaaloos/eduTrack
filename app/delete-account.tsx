import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppScreenBackground } from "../components/AppScreenBackground";
import { DeleteAccountAccordion } from "../components/deleteAccount/DeleteAccountAccordion";
import {
  DeleteAccountFixedHeader,
  deleteAccountHeaderTotalHeight,
} from "../components/deleteAccount/DeleteAccountFixedHeader";
import { WebPageCard } from "../components/layout/WebPageCard";
import { useLanguage } from "../src/context/languageContext";
import { CONTACT_EMAIL, copyrightFooterInset } from "../src/constants/appTheme";
import { submitContactInquiry } from "../src/services/contactInquiry";
import { showErrorAlert, showSuccessAlert } from "../src/utils/confirmDialog";
import { validateEmail } from "../src/utils/validation";

export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const headerHeight = deleteAccountHeaderTotalHeight(insets.top);
  const footerInset = copyrightFooterInset(insets.bottom);

  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openMailFallback = useCallback(
    async (trimmedEmail: string, trimmedNotes: string) => {
      const body = [
        t("deleteAccount.mailBodyIntro"),
        `${t("deleteAccount.accountEmail")}: ${trimmedEmail}`,
        trimmedNotes ? `\n${trimmedNotes}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
        t("deleteAccount.mailSubject"),
      )}&body=${encodeURIComponent(body)}`;

      await Linking.openURL(url);
    },
    [t],
  );

  const handleSubmit = useCallback(async () => {
    const trimmedEmail = email.trim();
    const trimmedNotes = notes.trim();

    if (!validateEmail(trimmedEmail)) {
      showErrorAlert(t("common.error"), t("deleteAccount.errorEmail"));
      return;
    }

    const message = [
      t("deleteAccount.messagePrefix"),
      `${t("deleteAccount.accountEmail")}: ${trimmedEmail}`,
      trimmedNotes || null,
    ]
      .filter(Boolean)
      .join("\n");

    setSubmitting(true);
    let saved = false;
    try {
      await submitContactInquiry({
        name: t("deleteAccount.requestName"),
        email: trimmedEmail,
        schoolName: "",
        message,
        language,
      });
      saved = true;
    } catch {
      // Still open mail — visitor can reach support directly.
    }

    try {
      await openMailFallback(trimmedEmail, trimmedNotes);
      showSuccessAlert(
        t("common.success"),
        saved
          ? t("deleteAccount.successSavedAndMail")
          : t("deleteAccount.mailClientOpened"),
      );
      if (saved) {
        setEmail("");
        setNotes("");
      }
    } catch {
      if (saved) {
        showSuccessAlert(t("common.success"), t("deleteAccount.success"));
        setEmail("");
        setNotes("");
      } else {
        showErrorAlert(t("common.error"), t("deleteAccount.errorSubmit"));
      }
    } finally {
      setSubmitting(false);
    }
  }, [email, language, notes, openMailFallback, t]);

  return (
    <AppScreenBackground>
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <DeleteAccountFixedHeader />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              styles.content,
              {
                paddingTop: headerHeight + 16,
                paddingBottom: footerInset,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <WebPageCard variant="content">
              <Text style={styles.heading}>{t("deleteAccount.heading")}</Text>
              <Text style={styles.subtitle}>{t("deleteAccount.subtitle")}</Text>
              <DeleteAccountAccordion />

              <Text style={styles.formHeading}>
                {t("deleteAccount.formHeading")}
              </Text>
              <Text style={styles.formHint}>{t("deleteAccount.formHint")}</Text>

              <View style={styles.field}>
                <Text style={styles.label}>{t("deleteAccount.accountEmail")}</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t("deleteAccount.accountEmailPlaceholder")}
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t("deleteAccount.notes")}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={t("deleteAccount.notesPlaceholder")}
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                onPress={() => void handleSubmit()}
                disabled={submitting}
                accessibilityRole="button"
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>
                      {t("deleteAccount.submit")}
                    </Text>
                    <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.hint}>
                {t("deleteAccount.directEmail", { email: CONTACT_EMAIL })}
              </Text>
            </WebPageCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </AppScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    alignItems: "center",
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    marginBottom: 24,
  },
  formHeading: {
    marginTop: 28,
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  formHint: {
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
    alignSelf: "stretch",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#FAFAFA",
  },
  textArea: {
    minHeight: 96,
    paddingTop: 12,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0F172A",
    borderRadius: 999,
    paddingVertical: 14,
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  hint: {
    marginTop: 16,
    fontSize: 13,
    lineHeight: 20,
    color: "#94A3B8",
    textAlign: "center",
  },
});
