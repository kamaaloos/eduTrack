import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../src/context/authContext";

type AdminScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showLogout?: boolean;
};

export const AdminScreenHeader: React.FC<AdminScreenHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showLogout = true,
}) => {
  const { t } = useTranslation();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(t("profile.signOutTitle"), t("profile.signOutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (err) {
            Alert.alert(
              t("common.error"),
              err instanceof Error ? err.message : t("common.somethingWentWrong"),
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
              <Ionicons name="school" size={22} color="#1E3A8A" />
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

          {showLogout ? (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              accessibilityLabel={t("common.logout")}
            >
              <Ionicons name="log-out-outline" size={18} color="#1E3A8A" />
              <Text style={styles.logoutText}>{t("common.logout")}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.logoutPlaceholder} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#1E3A8A",
  },
  header: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 52,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  subtitle: {
    color: "#BFDBFE",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flexShrink: 0,
    maxWidth: 100,
  },
  logoutText: {
    color: "#1E3A8A",
    fontWeight: "700",
    fontSize: 13,
  },
  logoutPlaceholder: {
    width: 100,
    flexShrink: 0,
  },
});
