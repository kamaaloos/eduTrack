import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PasswordInput } from "../components/PasswordInput";
import { AuthContext } from "../src/context/authContext";
import {
  completeRequiredPasswordChange,
  mapAuthError,
} from "../src/services/userProfile";
import { getPostLoginRoute } from "../src/utils/authNavigation";
import {
  isBlockedPassword,
  userMustChangePassword,
} from "../src/utils/mustChangePassword";

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const { user, userData, role, loading, logout, refreshUserProfile } =
    useContext(AuthContext);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && userData && !userMustChangePassword(userData) && role) {
      router.replace(getPostLoginRoute(role, userData) as never);
    }
  }, [loading, user, userData, role, router]);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert(t("common.required"), t("auth.changePassword.fillAll"));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t("common.error"), t("profile.mismatch"));
      return;
    }
    if (isBlockedPassword(newPassword)) {
      Alert.alert(t("common.error"), t("auth.changePassword.blockedDefault"));
      return;
    }

    setSubmitting(true);
    try {
      await completeRequiredPasswordChange(currentPassword, newPassword);
      await refreshUserProfile?.();
      Alert.alert(
        t("common.success"),
        t("auth.changePassword.success"),
        [
          {
            text: t("common.continue"),
            onPress: () => {
              if (role) {
                router.replace(getPostLoginRoute(role, { mustChangePassword: false }) as never);
              }
            },
          },
        ],
      );
    } catch (err) {
      Alert.alert(
        t("common.error"),
        mapAuthError(err, t("auth.changePassword.failed")),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t("auth.changePassword.logoutTitle"),
      t("auth.changePassword.logoutMsg"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.logout"),
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch {
              Alert.alert(t("common.error"), t("common.somethingWentWrong"));
            }
          },
        },
      ],
    );
  };

  if (loading || !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t("auth.changePassword.title")}</Text>
        <Text style={styles.subtitle}>{t("auth.changePassword.subtitle")}</Text>

        <Text style={styles.label}>{t("auth.changePassword.current")}</Text>
        <PasswordInput
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder={t("auth.changePassword.currentPlaceholder")}
          style={styles.input}
        />

        <Text style={styles.label}>{t("auth.changePassword.new")}</Text>
        <PasswordInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder={t("auth.changePassword.newPlaceholder")}
          style={styles.input}
        />

        <Text style={styles.label}>{t("auth.changePassword.confirm")}</Text>
        <PasswordInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t("auth.changePassword.confirmPlaceholder")}
          style={styles.input}
        />

        <Text style={styles.hint}>{t("auth.changePassword.hint")}</Text>

        <TouchableOpacity
          style={[styles.primaryBtn, submitting && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>
              {t("auth.changePassword.submit")}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleLogout}>
          <Text style={styles.secondaryBtnText}>{t("common.logout")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#F8FAFC" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: "#94A3B8",
    marginBottom: 20,
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  btnDisabled: { opacity: 0.7 },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
});
