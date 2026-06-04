import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthAboutLink } from "../components/auth/AuthAboutLink";
import { AuthFormField } from "../components/auth/AuthFormField";
import { AppLogo } from "../components/AppLogo";
import { ScreenBackgroundLayer } from "../components/ScreenBackgroundLayer";
import { useSchoolContext } from "../src/context/schoolContext";
import { APP_COPYRIGHT } from "../src/constants/appTheme";
import { webAuthContentStyle } from "../src/constants/webLayout";
import { WEB_PAGE_ROOT_STYLE } from "../src/constants/webBackground";
import { AuthContext } from "../src/context/authContext";
import { auth } from "../src/services/firebase";
import {
  confirmAction,
  showErrorAlert,
  showSuccessAlert,
} from "../src/utils/confirmDialog";
import { validateEmail } from "../src/utils/validation";

export default function Login() {
  const { t } = useTranslation();
  const { error: authError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedSchool, clearSchool, schoolReady } = useSchoolContext();

  useEffect(() => {
    if (schoolReady && !selectedSchool) {
      router.replace("/select-school");
    }
  }, [schoolReady, selectedSchool, router]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleChangeSchool = () => {
    void (async () => {
      const confirmed = await confirmAction(
        t("auth.login.changeSchoolTitle"),
        t("auth.login.changeSchoolMsg"),
        t("auth.login.changeSchool"),
        t("common.cancel"),
      );
      if (!confirmed) return;

      try {
        await clearSchool();
        router.replace("/select-school");
      } catch (err) {
        showErrorAlert(
          t("common.error"),
          err instanceof Error
            ? err.message
            : t("common.somethingWentWrong"),
        );
      }
    })();
  };

  const handleLogin = async () => {
    setError(null);

    if (!auth) {
      setError(t("auth.login.schoolNotReady"));
      return;
    }

    if (!email || !password) {
      setError(t("auth.login.enterEmailPassword"));
      return;
    }

    if (!validateEmail(email)) {
      setError(t("auth.login.invalidEmail"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth.login.passwordMin"));
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      // Navigation handled by auth context
      router.replace("/");
    } catch (err) {
      let message = t("auth.login.loginFailed");

      if (err instanceof Error) {
        if (err.message.includes("invalid-email")) {
          message = t("auth.login.invalidEmailAuth");
        } else if (err.message.includes("user-not-found")) {
          message = t("auth.login.userNotFound");
        } else if (err.message.includes("wrong-password")) {
          message = t("auth.login.wrongPassword");
        } else if (err.message.includes("too-many-requests")) {
          message = t("auth.login.tooManyRequests");
        } else {
          message = err.message;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!auth) {
      showErrorAlert(t("common.error"), t("auth.login.schoolNotReady"));
      return;
    }

    if (!resetEmail) {
      showErrorAlert(t("common.error"), t("auth.login.enterEmailPassword"));
      return;
    }

    if (!validateEmail(resetEmail)) {
      showErrorAlert(t("common.error"), t("auth.login.invalidEmail"));
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail.toLowerCase());
      showSuccessAlert(t("common.success"), t("auth.login.resetSent"));
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (err) {
      let message = t("auth.login.resetFailed");

      if (err instanceof Error) {
        if (err.message.includes("user-not-found")) {
          message = t("auth.login.userNotFound");
        } else if (err.message.includes("invalid-email")) {
          message = t("auth.login.invalidEmailAuth");
        } else {
          message = err.message;
        }
      }

      showErrorAlert(t("common.error"), message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <View style={[styles.background, WEB_PAGE_ROOT_STYLE]}>
      <ScreenBackgroundLayer />
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : Platform.OS === "android"
              ? "height"
              : undefined
        }
      >
        <AuthAboutLink
          style={[
            styles.aboutLink,
            { top: insets.top + 8 },
          ]}
        />
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            webAuthContentStyle(),
            {
              paddingTop: insets.top + 24,
              paddingBottom: insets.bottom + 56,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.logoContainer}>
          <AppLogo size={120} />
          <Text style={styles.title}>{t("auth.login.title")}</Text>
          <Text style={styles.subtitle}>{t("auth.login.subtitle")}</Text>

          {selectedSchool ? (
            <View style={styles.schoolBanner}>
              <Ionicons name="business" size={18} color="#1E3A8A" />
              <Text style={styles.schoolBannerText} numberOfLines={1}>
                {selectedSchool.name}
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.schoolBannerActionBtn,
                  pressed && styles.schoolBannerActionPressed,
                ]}
                onPress={handleChangeSchool}
                accessibilityRole="button"
                accessibilityLabel={t("auth.login.changeSchool")}
              >
                <Text style={styles.schoolBannerAction}>
                  {t("auth.login.changeSchool")}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <AuthFormField
            label={t("auth.login.email")}
            icon="person-outline"
            placeholder={t("auth.login.email")}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(null);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <View style={styles.passwordBlock}>
            <AuthFormField
              label={t("auth.login.password")}
              icon="key-outline"
              isPassword
              placeholder={t("auth.login.password")}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              editable={!loading}
              containerStyle={styles.passwordField}
            />
            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={() => setShowForgotPassword(true)}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>
                {t("auth.login.forgotPassword")}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>{t("auth.login.signIn")}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {t("auth.login.notRegisteredHint")}
            </Text>
          </View>
        </View>

        {showForgotPassword && (
          <View style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordTitle}>
              {t("auth.login.resetTitle")}
            </Text>
            <Text style={styles.forgotPasswordSubtitle}>
              {t("auth.login.resetHint")}
            </Text>

            <AuthFormField
              label={t("auth.login.email")}
              icon="person-outline"
              placeholder={t("auth.login.email")}
              value={resetEmail}
              onChangeText={setResetEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!resetLoading}
            />

            <View style={styles.forgotPasswordButtons}>
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  resetLoading && styles.buttonDisabled,
                ]}
                onPress={handleForgotPassword}
                disabled={resetLoading}
                activeOpacity={0.8}
              >
                {resetLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.buttonText}>{t("auth.login.sendReset")}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowForgotPassword(false);
                  setResetEmail("");
                }}
                disabled={resetLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        </ScrollView>

        <Text
          style={[styles.copyright, { paddingBottom: insets.bottom + 12 }]}
          accessibilityRole="text"
        >
          {APP_COPYRIGHT}
        </Text>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "relative",
  },

  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  aboutLink: {
    position: "absolute",
    right: 16,
    zIndex: 10,
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
    gap: 16,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0C4A6E",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: "#0369A1",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },

  schoolBanner: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "stretch",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },

  schoolBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A8A",
  },

  schoolBannerActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexShrink: 0,
  },
  schoolBannerActionPressed: {
    backgroundColor: "#EFF6FF",
  },
  schoolBannerAction: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },

  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },

  errorContainer: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },

  errorText: {
    color: "#B91C1C",
    fontSize: 14,
    textAlign: "center",
  },

  passwordBlock: {
    marginBottom: 0,
  },

  passwordField: {
    marginBottom: 0,
  },

  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    marginTop: 8,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  infoContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  infoText: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 21,
  },

  copyright: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(12, 74, 110, 0.75)",
    letterSpacing: 0.3,
  },

  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginTop: 8,
  },

  forgotPasswordText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },

  forgotPasswordContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },

  forgotPasswordTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },

  forgotPasswordSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },

  forgotPasswordButtons: {
    gap: 12,
  },

  resetButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  cancelButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },

  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
});
