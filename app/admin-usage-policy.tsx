import { Ionicons } from "@expo/vector-icons";
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
import { AppScreenBackground } from "../components/AppScreenBackground";
import { WebPageCard } from "../components/layout/WebPageCard";
import {
  USAGE_POLICY_SECTION_KEYS,
  USAGE_POLICY_VERSION,
} from "../src/constants/usagePolicy";
import { webAuthContentStyle } from "../src/constants/webLayout";
import { AuthContext } from "../src/context/authContext";
import { acceptAdminUsagePolicy } from "../src/services/usagePolicy";
import { getPostLoginRoute } from "../src/utils/authNavigation";
import {
  confirmDestructiveAction,
  showErrorAlert,
} from "../src/utils/confirmDialog";
import { userMustChangePassword } from "../src/utils/mustChangePassword";
import { adminMustAcceptUsagePolicy } from "../src/utils/usagePolicy";

export default function AdminUsagePolicyScreen() {
  const { t } = useTranslation();
  const { user, userData, role, loading, logout, refreshUserProfile } =
    useContext(AuthContext);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && role && role !== "admin") {
      router.replace(getPostLoginRoute(role, userData) as never);
      return;
    }
    if (!loading && user && userData && role === "admin") {
      if (userMustChangePassword(userData)) {
        router.replace("/change-password" as never);
        return;
      }
      if (!adminMustAcceptUsagePolicy(userData)) {
        router.replace(getPostLoginRoute(role, userData) as never);
      }
    }
  }, [loading, user, userData, role, router]);

  const handleAccept = async () => {
    if (!agreed) {
      Alert.alert(t("common.required"), t("adminUsagePolicy.mustAgree"));
      return;
    }

    setSubmitting(true);
    try {
      await acceptAdminUsagePolicy();
      await refreshUserProfile?.();
      router.replace(
        getPostLoginRoute(role ?? "admin", {
          ...userData,
          usagePolicyAcceptedVersion: USAGE_POLICY_VERSION,
        }) as never,
      );
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("adminUsagePolicy.failed"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = () => {
    void (async () => {
      const confirmed = await confirmDestructiveAction(
        t("adminUsagePolicy.declineTitle"),
        t("adminUsagePolicy.declineMsg"),
        t("adminUsagePolicy.decline"),
        t("common.cancel"),
      );
      if (!confirmed) return;

      try {
        await logout();
      } catch {
        showErrorAlert(t("common.error"), t("common.somethingWentWrong"));
      }
    })();
  };

  if (loading || !user || role !== "admin") {
    return (
      <AppScreenBackground showCopyright={false}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </AppScreenBackground>
    );
  }

  return (
    <AppScreenBackground showCopyright={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            webAuthContentStyle(),
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <WebPageCard>
            <Text style={styles.title}>{t("adminUsagePolicy.title")}</Text>
            <Text style={styles.subtitle}>{t("adminUsagePolicy.subtitle")}</Text>
            <Text style={styles.meta}>
              {t("adminUsagePolicy.versionLabel", { version: USAGE_POLICY_VERSION })}
            </Text>
            <Text style={styles.meta}>{t("adminUsagePolicy.lastUpdated")}</Text>

            <View style={styles.policyCard}>
              {USAGE_POLICY_SECTION_KEYS.map((section) => (
                <View key={section.titleKey} style={styles.section}>
                  <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
                  <Text style={styles.sectionBody}>{t(section.bodyKey)}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreed((value) => !value)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreed }}
            >
              <Ionicons
                name={agreed ? "checkbox" : "square-outline"}
                size={22}
                color={agreed ? "#4F46E5" : "#94A3B8"}
              />
              <Text style={styles.checkboxLabel}>
                {t("adminUsagePolicy.acceptCheckbox")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (!agreed || submitting) && styles.btnDisabled,
              ]}
              onPress={handleAccept}
              disabled={!agreed || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {t("adminUsagePolicy.submit")}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
              <Text style={styles.declineBtnText}>
                {t("adminUsagePolicy.decline")}
              </Text>
            </TouchableOpacity>
          </WebPageCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    marginBottom: 10,
  },
  meta: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 4,
  },
  policyCard: {
    marginTop: 18,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 16,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.55,
  },
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  declineBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  declineBtnText: {
    color: "#B45309",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryBtnText: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "600",
  },
});
