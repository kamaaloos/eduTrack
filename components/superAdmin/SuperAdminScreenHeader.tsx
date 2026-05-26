import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSuperAdminAuth } from "../../src/context/superAdminAuthContext";

type SuperAdminScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
};

export function SuperAdminScreenHeader({
  title,
  subtitle,
  showBack = false,
}: SuperAdminScreenHeaderProps) {
  const { t } = useTranslation();
  const { logout } = useSuperAdminAuth();

  const handleLogout = () => {
    Alert.alert(t("superAdmin.signOutTitle"), t("superAdmin.signOutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("superAdmin.signOutTitle"),
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (err) {
            Alert.alert(
              t("common.error"),
              err instanceof Error ? err.message : t("superAdmin.signOutFailed"),
            );
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.row}>
          {showBack ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel={t("admin.goBackA11y")}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.brandBadge}>
              <Ionicons name="planet" size={22} color="#1E3A8A" />
            </View>
          )}

          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            accessibilityLabel={t("superAdmin.signOutTitle")}
          >
            <Ionicons name="log-out-outline" size={18} color="#1E3A8A" />
            <Text style={styles.logoutText}>{t("common.logout")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#1E3A8A",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    color: "#BFDBFE",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: "#1E3A8A",
    fontWeight: "700",
    fontSize: 13,
  },
});
