import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
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
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PasswordInput } from "../../components/PasswordInput";
import { useSuperAdminAuth } from "../../src/context/superAdminAuthContext";
import { registryAuth } from "../../src/services/firebase";

export default function SuperAdminLoginScreen() {
  const { t } = useTranslation();
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

    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(
        registryAuth,
        email.trim().toLowerCase(),
        password,
      );
      router.replace("/(super-admin)/schools");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("superAdmin.loginFailed"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + 24,
              paddingBottom: insets.bottom + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.replace("/select-school")}
          >
            <Ionicons name="chevron-back" size={18} color="#1E3A8A" />
            <Text style={styles.backLinkText}>{t("superAdmin.backToSchoolList")}</Text>
          </TouchableOpacity>

          <View style={styles.hero}>
            <View style={styles.iconCircle}>
              <Ionicons name="planet" size={40} color="#1E3A8A" />
            </View>
            <Text style={styles.title}>{t("superAdmin.loginTitle")}</Text>
            <Text style={styles.subtitle}>{t("superAdmin.loginSubtitle")}</Text>
          </View>

          {(error || authError) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error || authError}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Text style={styles.label}>{t("common.email")}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="superadmin@example.com"
              placeholderTextColor="#94A3B8"
              editable={!submitting}
            />

            <Text style={styles.label}>{t("common.password")}</Text>
            <PasswordInput
              value={password}
              onChangeText={setPassword}
              placeholder={t("common.password")}
              editable={!submitting}
              inputStyle={styles.input}
            />

            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={() => void handleLogin()}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{t("auth.login.signIn")}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>{t("superAdmin.setupReminderTitle")}</Text>
            <Text style={styles.noteText}>{t("superAdmin.setupReminderText")}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 20,
  },
  backLinkText: {
    color: "#1E3A8A",
    fontWeight: "600",
    fontSize: 15,
  },
  hero: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E3A8A",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 14,
    textAlign: "center",
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginBottom: 8,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#1E3A8A",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
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
    marginTop: 20,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
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
