import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from "react-native";
import { APP_DISPLAY_NAME } from "../../src/constants/brand";
import {
  CONTACT_EMAIL,
  MOBILE_SCREEN_HORIZONTAL_PADDING,
} from "../../src/constants/appTheme";
import { platformShadow } from "../../src/utils/platformShadow";

type ContactNativeViewProps = {
  name: string;
  email: string;
  schoolName: string;
  message: string;
  submitting: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSchoolNameChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onSubmit: () => void;
};

type ContactFieldProps = TextInputProps & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
};

function ContactField({
  label,
  icon,
  multiline,
  style,
  ...rest
}: ContactFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, multiline && styles.inputRowMultiline]}>
        <View style={[styles.inputIconWrap, multiline && styles.inputIconWrapTop]}>
          <Ionicons name={icon} size={18} color="#64748B" />
        </View>
        <TextInput
          {...rest}
          style={[styles.input, multiline && styles.textArea, style]}
          placeholderTextColor="#94A3B8"
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
        />
      </View>
    </View>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function ContactNativeView({
  name,
  email,
  schoolName,
  message,
  submitting,
  onNameChange,
  onEmailChange,
  onSchoolNameChange,
  onMessageChange,
  onSubmit,
}: ContactNativeViewProps) {
  const { t } = useTranslation();

  const openDirectEmail = () => {
    void Linking.openURL(`mailto:${CONTACT_EMAIL}`);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <View style={styles.heroIconRing}>
          <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.heroTitle}>{t("contact.heading")}</Text>
        <Text style={styles.heroSubtitle}>
          {t("contact.subtitle", { appName: APP_DISPLAY_NAME })}
        </Text>
      </View>

      <SectionCard title={t("contact.formSection")}>
        <ContactField
          label={t("contact.name")}
          icon="person-outline"
          value={name}
          onChangeText={onNameChange}
          placeholder={t("contact.namePlaceholder")}
          autoCapitalize="words"
        />
        <ContactField
          label={t("contact.email")}
          icon="mail-outline"
          value={email}
          onChangeText={onEmailChange}
          placeholder={t("contact.emailPlaceholder")}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <ContactField
          label={t("contact.schoolName")}
          icon="school-outline"
          value={schoolName}
          onChangeText={onSchoolNameChange}
          placeholder={t("contact.schoolNamePlaceholder")}
          autoCapitalize="words"
        />
        <ContactField
          label={t("contact.message")}
          icon="create-outline"
          value={message}
          onChangeText={onMessageChange}
          placeholder={t("contact.messagePlaceholder")}
          multiline
        />

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={onSubmit}
          disabled={submitting}
          activeOpacity={0.88}
          accessibilityRole="button"
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>{t("contact.submit")}</Text>
            </>
          )}
        </TouchableOpacity>
      </SectionCard>

      <TouchableOpacity
        style={styles.emailCard}
        onPress={openDirectEmail}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={t("contact.directEmail", { email: CONTACT_EMAIL })}
      >
        <View style={styles.emailIconWrap}>
          <Ionicons name="mail" size={20} color="#1E3A8A" />
        </View>
        <View style={styles.emailTextCol}>
          <Text style={styles.emailLabel}>{t("contact.directEmailTitle")}</Text>
          <Text style={styles.emailValue}>{CONTACT_EMAIL}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </TouchableOpacity>

      <Text style={styles.footerHint}>{t("contact.responseHint")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignSelf: "stretch",
    paddingHorizontal: MOBILE_SCREEN_HORIZONTAL_PADDING,
    gap: 16,
  },
  hero: {
    backgroundColor: "#1E3A8A",
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: "center",
    ...platformShadow("lg"),
  },
  heroIconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#BFDBFE",
    textAlign: "center",
    maxWidth: 300,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...platformShadow("md"),
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 50,
  },
  inputRowMultiline: {
    alignItems: "stretch",
    minHeight: 132,
  },
  inputIconWrap: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  inputIconWrapTop: {
    paddingTop: 14,
    alignSelf: "flex-start",
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingRight: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
  },
  textArea: {
    minHeight: 108,
    paddingTop: 14,
    paddingBottom: 14,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 6,
    ...platformShadow("sm"),
  },
  submitBtnDisabled: {
    opacity: 0.72,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    ...platformShadow("sm"),
  },
  emailIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  emailTextCol: {
    flex: 1,
    minWidth: 0,
  },
  emailLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 2,
  },
  emailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  footerHint: {
    fontSize: 12,
    lineHeight: 18,
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 12,
    marginBottom: 4,
  },
});
