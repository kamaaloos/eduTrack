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
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
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
import { PasswordInput } from "../components/PasswordInput";
import { useSchoolContext } from "../src/context/schoolContext";
import { APP_COPYRIGHT } from "../src/constants/appTheme";
import { AuthContext } from "../src/context/authContext";
import { auth } from "../src/services/firebase";

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

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
    Alert.alert(
      t("auth.login.changeSchoolTitle"),
      t("auth.login.changeSchoolMsg"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("auth.login.changeSchool"),
          onPress: async () => {
            try {
              await clearSchool();
              router.replace("/select-school");
            } catch (err) {
              Alert.alert(
                t("common.error"),
                err instanceof Error
                  ? err.message
                  : t("common.somethingWentWrong"),
              );
            }
          },
        },
      ],
    );
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
      Alert.alert(t("common.error"), t("auth.login.schoolNotReady"));
      return;
    }

    if (!resetEmail) {
      Alert.alert(t("common.error"), t("auth.login.enterEmailPassword"));
      return;
    }

    if (!validateEmail(resetEmail)) {
      Alert.alert(t("common.error"), t("auth.login.invalidEmail"));
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail.toLowerCase());
      Alert.alert(t("common.success"), t("auth.login.resetSent"), [
        {
          text: t("common.confirm"),
          onPress: () => {
            setShowForgotPassword(false);
            setResetEmail("");
          },
        },
      ]);
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

      Alert.alert(t("common.error"), message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/login-bg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            {
              paddingTop: insets.top + 24,
              paddingBottom: insets.bottom + 56,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🎓</Text>
          </View>
          <Text style={styles.title}>{t("auth.login.title")}</Text>
          <Text style={styles.subtitle}>{t("auth.login.subtitle")}</Text>

          {selectedSchool ? (
            <TouchableOpacity
              style={styles.schoolBanner}
              onPress={handleChangeSchool}
              activeOpacity={0.85}
            >
              <Ionicons name="business" size={18} color="#1E3A8A" />
              <Text style={styles.schoolBannerText} numberOfLines={1}>
                {selectedSchool.name}
              </Text>
              <Text style={styles.schoolBannerAction}>
                {t("auth.login.changeSchool")}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t("auth.login.email")}</Text>
            <TextInput
              placeholder={t("auth.login.email")}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t("auth.login.password")}</Text>
            <PasswordInput
              placeholder={t("auth.login.password")}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              inputStyle={styles.input}
              editable={!loading}
              placeholderTextColor="#9CA3AF"
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

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("auth.login.email")}</Text>
              <TextInput
                placeholder={t("auth.login.email")}
                value={resetEmail}
                onChangeText={setResetEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!resetLoading}
                placeholderTextColor="#9CA3AF"
              />
            </View>

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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },

  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  logoText: {
    fontSize: 32,
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

  inputContainer: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    color: "#111827",
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
