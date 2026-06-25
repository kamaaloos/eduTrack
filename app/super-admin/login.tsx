import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppScreenBackground } from "../../components/AppScreenBackground";
import { AuthFormField } from "../../components/auth/AuthFormField";
import { WebPageCard } from "../../components/layout/WebPageCard";
import { platformShadow } from "../../src/utils/platformShadow";
import { useLanguage } from "../../src/context/languageContext";
import { useSuperAdminAuth } from "../../src/context/superAdminAuthContext";
import { WEB_PAGE_ROOT_STYLE } from "../../src/constants/webBackground";
import { webAuthContentStyle } from "../../src/constants/webLayout";
import { registryAuth } from "../../src/services/firebase";

export default function SuperAdminLoginScreen() {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const insets = useSafeAreaInsets();
  const { user, role, loading, error: authError } = useSuperAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && role === "superAdmin") {
      router.replace("/(super-admin)/schools");
    }
  }, [loading, user, role]);

  const handleLogin = async () => {
    setError(null);

    if (!email.trim() || !password) {
      setError(t("superAdmin.enterEmailPassword"));
      return;
    }

    if (!registryAuth) {
      setError(t("common.firebaseConfigMissingHint"));
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(
        registryAuth,
        email.trim().toLowerCase(),
        password,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("superAdmin.loginFailed"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const Frame = AppScreenBackground;
  const frameProps = { showCopyright: false };

  return (
    <Frame {...frameProps}>
      <View style={[styles.screen, WEB_PAGE_ROOT_STYLE]}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              webAuthContentStyle(),
              {
                paddingTop: insets.top + 24,
                paddingBottom: insets.bottom + 40,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <WebPageCard>
            <View style={[styles.navRow, isRtl && styles.navRowRtl]}>
              <Pressable
                style={({ pressed }) => [
                  styles.navPill,
                  pressed && styles.navPillPressed,
                ]}
                onPress={() => router.replace("/select-school")}
              >
                <Ionicons
                  name={isRtl ? "chevron-forward" : "chevron-back"}
                  size={16}
                  color="#1E3A8A"
                />
                <Text style={styles.navPillText}>
                  {t("superAdmin.backToSchoolList")}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.navPill,
                  pressed && styles.navPillPressed,
                ]}
                onPress={() => router.replace("/onboarding")}
              >
                <Ionicons name="home-outline" size={16} color="#475569" />
                <Text style={styles.navPillTextMuted}>
                  {t("selectSchool.backToOnboarding")}
                </Text>
              </Pressable>
            </View>

            <View style={styles.hero}>
              <View style={styles.iconCircle}>
                <Ionicons name="planet" size={40} color="#1E3A8A" />
              </View>
              <Text style={[styles.title, isRtl && styles.textRtl]}>
                {t("superAdmin.loginTitle")}
              </Text>
              <Text style={[styles.subtitle, isRtl && styles.textRtl]}>
                {t("superAdmin.loginSubtitle")}
              </Text>
            </View>

            {(error || authError) ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error || authError}</Text>
              </View>
            ) : null}

            <View style={styles.formCard}>
              <AuthFormField
                label={t("common.email")}
                icon="person-outline"
                placeholder="superadmin@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!submitting}
                inputStyle={isRtl ? styles.inputRtl : undefined}
              />

              <AuthFormField
                label={t("common.password")}
                icon="key-outline"
                isPassword
                placeholder={t("common.password")}
                value={password}
                onChangeText={setPassword}
                editable={!submitting}
                containerStyle={styles.passwordField}
                inputStyle={isRtl ? styles.inputRtl : undefined}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  submitting && styles.buttonDisabled,
                  pressed && !submitting && styles.buttonPressed,
                ]}
                onPress={() => void handleLogin()}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>{t("auth.login.signIn")}</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.noteCard}>
              <Text style={[styles.noteTitle, isRtl && styles.textRtl]}>
                {t("superAdmin.setupReminderTitle")}
              </Text>
              <Text style={[styles.noteText, isRtl && styles.textRtl]}>
                {t("superAdmin.setupReminderText")}
              </Text>
            </View>
            </WebPageCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Frame>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    backgroundColor: "transparent",
  },
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    width: "100%",
  },
  navRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
    alignSelf: "stretch",
  },
  navRowRtl: {
    flexDirection: "row-reverse",
  },
  navPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  navPillPressed: {
    opacity: 0.88,
  },
  navPillText: {
    color: "#1E3A8A",
    fontWeight: "600",
    fontSize: 13,
  },
  navPillTextMuted: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 13,
  },
  hero: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E3A8A",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 360,
  },
  textRtl: {
    writingDirection: "rtl",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 14,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    width: "100%",
    ...platformShadow("md"),
  },
  passwordField: {
    marginBottom: 8,
  },
  inputRtl: {
    writingDirection: "rtl",
    textAlign: "right",
  },
  button: {
    marginTop: 12,
    backgroundColor: "#1E3A8A",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    width: "100%",
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  noteCard: {
    marginTop: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    width: "100%",
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },
});
