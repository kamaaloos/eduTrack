import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppLogo } from "../components/AppLogo";
import { AppScreenBackground } from "../components/AppScreenBackground";
import { WebPageCard } from "../components/layout/WebPageCard";
import {
  DownloadFixedHeader,
  downloadHeaderTotalHeight,
} from "../components/download/DownloadFixedHeader";
import {
  APP_STORE_URL,
  isAppStoreConfigured,
  isPlayStoreConfigured,
  PLAY_STORE_URL,
} from "../src/constants/appStores";
import { copyrightFooterInset } from "../src/constants/appTheme";
import { showErrorAlert } from "../src/utils/confirmDialog";

type StoreButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  eyebrow: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
  variant: "apple" | "google";
};

function StoreButton({
  icon,
  eyebrow,
  title,
  subtitle,
  onPress,
  disabled,
  variant,
}: StoreButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.storeBtn,
        variant === "apple" ? styles.storeBtnApple : styles.storeBtnGoogle,
        disabled && styles.storeBtnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="link"
    >
      <Ionicons name={icon} size={36} color="#FFFFFF" />
      <View style={styles.storeBtnTextWrap}>
        <Text style={styles.storeBtnEyebrow}>{eyebrow}</Text>
        <Text style={styles.storeBtnTitle}>{title}</Text>
        {subtitle ? <Text style={styles.storeBtnSubtitle}>{subtitle}</Text> : null}
      </View>
      {!disabled ? (
        <Ionicons name="open-outline" size={18} color="rgba(255,255,255,0.85)" />
      ) : null}
    </TouchableOpacity>
  );
}

export default function DownloadScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const headerHeight = downloadHeaderTotalHeight(insets.top);
  const footerInset = copyrightFooterInset(insets.bottom);

  const openStoreUrl = useCallback(
    async (url: string) => {
      if (!url) return;
      try {
        const supported = await Linking.canOpenURL(url);
        if (!supported) {
          showErrorAlert(t("common.error"), t("download.openFailed"));
          return;
        }
        await Linking.openURL(url);
      } catch {
        showErrorAlert(t("common.error"), t("download.openFailed"));
      }
    },
    [t],
  );

  const playReady = isPlayStoreConfigured();
  const appStoreReady = isAppStoreConfigured();

  return (
    <AppScreenBackground>
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <DownloadFixedHeader />
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
                <AppLogo size={88} />
                <Text style={styles.heading}>{t("download.heading")}</Text>
                <Text style={styles.subtitle}>{t("download.subtitle")}</Text>
              </View>

              <View style={styles.storeList}>
                <StoreButton
                  variant="google"
                  icon="logo-google-playstore"
                  eyebrow={t("download.googlePlayEyebrow")}
                  title={t("download.googlePlayTitle")}
                  onPress={() => void openStoreUrl(PLAY_STORE_URL)}
                  disabled={!playReady}
                  subtitle={!playReady ? t("download.comingSoon") : undefined}
                />

                <StoreButton
                  variant="apple"
                  icon="logo-apple-appstore"
                  eyebrow={t("download.appStoreEyebrow")}
                  title={t("download.appStoreTitle")}
                  onPress={() => void openStoreUrl(APP_STORE_URL)}
                  disabled={!appStoreReady}
                  subtitle={!appStoreReady ? t("download.comingSoon") : undefined}
                />
              </View>

              {!appStoreReady ? (
                <Text style={styles.hint}>{t("download.appStorePendingHint")}</Text>
              ) : null}
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
    marginBottom: 24,
    gap: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 360,
  },
  storeList: {
    gap: 14,
  },
  storeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    minHeight: 72,
  },
  storeBtnApple: {
    backgroundColor: "#0F172A",
  },
  storeBtnGoogle: {
    backgroundColor: "#111827",
  },
  storeBtnDisabled: {
    opacity: 0.55,
  },
  storeBtnTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  storeBtnEyebrow: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.82)",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  storeBtnTitle: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  storeBtnSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
  },
  hint: {
    marginTop: 16,
    fontSize: 13,
    lineHeight: 20,
    color: "#94A3B8",
    textAlign: "center",
  },
});
