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
import {
  ContactFixedHeader,
  contactHeaderTotalHeight,
} from "../components/contact/ContactFixedHeader";
import { ContactNativeView } from "../components/contact/ContactNativeView";
import { AppScreenBackground } from "../components/AppScreenBackground";
import { WebPageCard } from "../components/layout/WebPageCard";
import { useLanguage } from "../src/context/languageContext";
import { CONTACT_EMAIL, copyrightFooterInset } from "../src/constants/appTheme";
import { submitContactInquiry } from "../src/services/contactInquiry";
import { showErrorAlert, showSuccessAlert } from "../src/utils/confirmDialog";
import { validateEmail } from "../src/utils/validation";

export default function ContactScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const headerHeight = contactHeaderTotalHeight(insets.top);
  const footerInset = copyrightFooterInset(insets.bottom);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openMailFallback = useCallback(async () => {
    const body = [
      `${t("contact.name")}: ${name.trim()}`,
      `${t("contact.email")}: ${email.trim()}`,
      schoolName.trim()
        ? `${t("contact.schoolName")}: ${schoolName.trim()}`
        : null,
      "",
      message.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      t("contact.mailSubject", { name: name.trim() }),
    )}&body=${encodeURIComponent(body)}`;

    await Linking.openURL(url);
  }, [email, message, name, schoolName, t]);

  const handleSubmit = useCallback(async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      showErrorAlert(t("common.error"), t("contact.errorName"));
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      showErrorAlert(t("common.error"), t("contact.errorEmail"));
      return;
    }
    if (trimmedMessage.length < 10) {
      showErrorAlert(t("common.error"), t("contact.errorMessage"));
      return;
    }

    setSubmitting(true);
    let saved = false;
    try {
      await submitContactInquiry({
        name: trimmedName,
        email: trimmedEmail,
        schoolName: schoolName.trim(),
        message: trimmedMessage,
        language,
      });
      saved = true;
    } catch {
      // Still open mail — visitor can reach support directly.
    }

    try {
      await openMailFallback();
      showSuccessAlert(
        t("common.success"),
        saved ? t("contact.successSavedAndMail") : t("contact.mailClientOpened"),
      );
      if (saved) {
        setName("");
        setEmail("");
        setSchoolName("");
        setMessage("");
      }
    } catch {
      if (saved) {
        showSuccessAlert(t("common.success"), t("contact.success"));
        setName("");
        setEmail("");
        setSchoolName("");
        setMessage("");
      } else {
        showErrorAlert(t("common.error"), t("contact.errorSubmit"));
      }
    } finally {
      setSubmitting(false);
    }
  }, [email, language, message, name, openMailFallback, schoolName, t]);

  const formProps = {
    name,
    email,
    schoolName,
    message,
    submitting,
    onNameChange: setName,
    onEmailChange: setEmail,
    onSchoolNameChange: setSchoolName,
    onMessageChange: setMessage,
    onSubmit: () => void handleSubmit(),
  };

  return (
    <AppScreenBackground>
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <ContactFixedHeader />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              styles.content,
              Platform.OS !== "web" && styles.contentNative,
              {
                paddingTop: headerHeight + 16,
                paddingBottom: footerInset,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {Platform.OS === "web" ? (
            <WebPageCard>
                <Text style={styles.title}>{t("contact.heading")}</Text>
                <Text style={styles.subtitle}>{t("contact.subtitle")}</Text>

                <View style={styles.field}>
                  <Text style={styles.label}>{t("contact.name")}</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder={t("contact.namePlaceholder")}
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>{t("contact.email")}</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t("contact.emailPlaceholder")}
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>{t("contact.schoolName")}</Text>
                  <TextInput
                    style={styles.input}
                    value={schoolName}
                    onChangeText={setSchoolName}
                    placeholder={t("contact.schoolNamePlaceholder")}
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>{t("contact.message")}</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={message}
                    onChangeText={setMessage}
                    placeholder={t("contact.messagePlaceholder")}
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
                      <Text style={styles.submitBtnText}>{t("contact.submit")}</Text>
                      <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.hint}>{t("contact.directEmail", { email: CONTACT_EMAIL })}</Text>
            </WebPageCard>
            ) : (
              <ContactNativeView {...formProps} />
            )}
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
  },
  contentNative: {
    paddingHorizontal: 0,
    alignItems: "stretch",
  },
  title: {
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
  field: {
    marginBottom: 16,
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
    minHeight: 120,
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
