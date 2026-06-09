import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  webAdminContentStyle,
  webAdminPagePaddingStyle,
} from "../../src/constants/webLayout";

type SuperAdminScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onMenuPress?: () => void;
};

export function SuperAdminScreenHeader({
  title,
  subtitle,
  showBack = false,
  onMenuPress,
}: SuperAdminScreenHeaderProps) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={[styles.headerInner, webAdminContentStyle(), webAdminPagePaddingStyle()]}>
          <View style={styles.row}>
            {showBack ? (
              <TouchableOpacity
                style={styles.sideButton}
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

            {onMenuPress ? (
              <TouchableOpacity
                style={styles.menuButton}
                onPress={onMenuPress}
                accessibilityLabel={t("admin.management")}
              >
                <Ionicons name="menu" size={20} color="#1E3A8A" />
              </TouchableOpacity>
            ) : null}
          </View>
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
    backgroundColor: "#1E3A8A",
    paddingBottom: Platform.OS === "web" ? 14 : 18,
    borderBottomLeftRadius: Platform.OS === "web" ? 0 : 24,
    borderBottomRightRadius: Platform.OS === "web" ? 0 : 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === "web" ? 0.08 : 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  headerInner: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: Platform.OS === "web" ? 48 : 52,
  },
  sideButton: {
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
    fontSize: Platform.OS === "web" ? 18 : 20,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  subtitle: {
    color: "#BFDBFE",
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
