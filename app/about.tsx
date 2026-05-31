import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppScreenBackground } from "../components/AppScreenBackground";
import { LanguageSelector } from "../components/LanguageSelector";
import { APP_BUILDS_URL } from "../src/constants/appTheme";
import {
  getAppBuildNumber,
  getAppVersion,
} from "../src/utils/appVersion";

export default function AboutScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const openBuildsPage = async () => {
    try {
      const supported = await Linking.canOpenURL(APP_BUILDS_URL);
      if (!supported) {
        Alert.alert(t("common.error"), t("about.openBuildsFailed"));
        return;
      }
      await Linking.openURL(APP_BUILDS_URL);
    } catch {
      Alert.alert(t("common.error"), t("about.openBuildsFailed"));
    }
  };

  return (
    <AppScreenBackground>
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 72,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={18} color="#1E3A8A" />
            <Text style={styles.backLinkText}>{t("common.back")}</Text>
          </TouchableOpacity>

          <View style={styles.hero}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>🎓</Text>
            </View>
            <Text style={styles.appName}>{t("about.appName")}</Text>
            <Text style={styles.tagline}>{t("about.tagline")}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("about.appInfo")}</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t("common.version")}</Text>
              <Text style={styles.rowValue}>{getAppVersion()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t("about.build")}</Text>
              <Text style={styles.rowValue}>{getAppBuildNumber()}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <LanguageSelector title={t("about.language")} showTitle />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("about.updatesTitle")}</Text>
            <Text style={styles.bodyText}>{t("about.updatesBody")}</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => void openBuildsPage()}
              activeOpacity={0.85}
            >
              <Ionicons name="download-outline" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>{t("about.openBuilds")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </AppScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: 24,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  backLinkText: {
    color: "#1E3A8A",
    fontWeight: "600",
    fontSize: 15,
  },
  hero: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logoText: {
    fontSize: 32,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0C4A6E",
  },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.85)",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E3A8A",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  rowLabel: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "600",
  },
  rowValue: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "700",
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
