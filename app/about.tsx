import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
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
import {
  AboutFixedHeader,
  aboutHeaderTotalHeight,
} from "../components/about/AboutFixedHeader";
import { AppScreenBackground } from "../components/AppScreenBackground";
import { AppLogo } from "../components/AppLogo";
import { LanguageSelector } from "../components/LanguageSelector";
import { WebPageCard } from "../components/layout/WebPageCard";
import { useAppUpdateCheck } from "../hooks/useAppUpdateCheck";
import { copyrightFooterInset } from "../src/constants/appTheme";
import {
  getAppBuildNumber,
  getAppVersion,
  getAppVersionLabel,
} from "../src/utils/appVersion";

export default function AboutScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { status, refresh } = useAppUpdateCheck();
  const headerHeight = aboutHeaderTotalHeight(insets.top);
  const footerInset = copyrightFooterInset(insets.bottom);

  const openApkDownload = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert(t("common.error"), t("about.downloadUpdateFailed"));
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert(t("common.error"), t("about.downloadUpdateFailed"));
    }
  };

  const renderUpdateSection = () => {
    if (status.state === "checking") {
      return (
        <View style={styles.updateRow}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.bodyText}>{t("about.checkingUpdates")}</Text>
        </View>
      );
    }

    if (status.state === "upToDate") {
      return (
        <>
          <View style={styles.statusPillOk}>
            <Ionicons name="checkmark-circle" size={18} color="#15803D" />
            <Text style={styles.statusPillOkText}>{t("about.upToDate")}</Text>
          </View>
          <Text style={styles.metaText}>
            {t("about.latestKnown", {
              version: status.latestVersion,
              build: status.latestBuild,
            })}
          </Text>
        </>
      );
    }

    if (status.state === "updateAvailable") {
      return (
        <>
          <View style={styles.statusPillWarn}>
            <Ionicons name="arrow-up-circle" size={18} color="#B45309" />
            <Text style={styles.statusPillWarnText}>
              {t("about.updateAvailable")}
            </Text>
          </View>
          <Text style={styles.bodyText}>
            {t("about.updateAvailableBody", {
              version: status.latestVersion,
              build: status.latestBuild,
              current: getAppVersionLabel(),
            })}
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => void openApkDownload(status.apkUrl)}
            activeOpacity={0.85}
          >
            <Ionicons name="download-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>
              {t("about.downloadUpdate")}
            </Text>
          </TouchableOpacity>
        </>
      );
    }

    if (status.state === "unsupported") {
      return <Text style={styles.bodyText}>{t("about.updatesWebOnly")}</Text>;
    }

    return (
      <>
        <Text style={styles.bodyText}>{t("about.updatesUnknown")}</Text>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => void refresh()}
          activeOpacity={0.85}
        >
          <Ionicons name="refresh-outline" size={18} color="#1E3A8A" />
          <Text style={styles.secondaryButtonText}>{t("about.checkAgain")}</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <AppScreenBackground>
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <AboutFixedHeader />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: headerHeight + 16,
              paddingBottom: footerInset,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <WebPageCard>
              <View style={styles.hero}>
                <AppLogo size={96} />
                <Text style={styles.appName}>{t("about.appName")}</Text>
                <Text style={styles.tagline}>{t("about.tagline")}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.cardTitle}>{t("about.appInfo")}</Text>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{t("common.version")}</Text>
                  <Text style={styles.rowValue}>{getAppVersion()}</Text>
                </View>
                <View style={[styles.row, styles.rowLast]}>
                  <Text style={styles.rowLabel}>{t("about.build")}</Text>
                  <Text style={styles.rowValue}>{getAppBuildNumber()}</Text>
                </View>
                <Text style={styles.hintText}>{t("about.versionHint")}</Text>
              </View>

              <View style={styles.sectionDivider} />

              <View style={styles.section}>
                <LanguageSelector compact title={t("about.language")} showTitle />
              </View>

              <View style={styles.sectionDivider} />

              <View style={styles.section}>
                <Text style={styles.cardTitle}>{t("about.updatesTitle")}</Text>
                {renderUpdateSection()}
              </View>
          </WebPageCard>
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
    paddingHorizontal: 20,
    alignItems: "center",
  },
  hero: {
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0C4A6E",
  },
  tagline: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 360,
  },
  section: {
    paddingVertical: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#EEF2F7",
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
  rowLast: {
    borderBottomWidth: 0,
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
  hintText: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: "#94A3B8",
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
    marginBottom: 12,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },
  updateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusPillOk: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    backgroundColor: "#DCFCE7",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  statusPillOkText: {
    color: "#15803D",
    fontWeight: "700",
    fontSize: 14,
  },
  statusPillWarn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    backgroundColor: "#FEF3C7",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  statusPillWarnText: {
    color: "#B45309",
    fontWeight: "700",
    fontSize: 14,
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
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
  secondaryButtonText: {
    color: "#1E3A8A",
    fontSize: 15,
    fontWeight: "700",
  },
});
