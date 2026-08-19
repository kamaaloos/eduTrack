import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppScreenBackground } from "../components/AppScreenBackground";
import { WebPageCard } from "../components/layout/WebPageCard";
import {
  PrivacyPolicyFixedHeader,
  privacyPolicyHeaderTotalHeight,
} from "../components/privacy/PrivacyPolicyFixedHeader";
import { PRIVACY_POLICY_SECTION_KEYS } from "../src/constants/privacyPolicy";
import { copyrightFooterInset } from "../src/constants/appTheme";

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const headerHeight = privacyPolicyHeaderTotalHeight(insets.top);
  const footerInset = copyrightFooterInset(insets.bottom);

  return (
    <AppScreenBackground>
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <PrivacyPolicyFixedHeader />
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
          <WebPageCard variant="content">
            <Text style={styles.heading}>{t("privacyPolicy.heading")}</Text>
            <Text style={styles.subtitle}>{t("privacyPolicy.subtitle")}</Text>
            <Text style={styles.updated}>{t("privacyPolicy.lastUpdated")}</Text>

            {PRIVACY_POLICY_SECTION_KEYS.map((section) => (
              <View key={section.titleKey} style={styles.section}>
                <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
                <Text style={styles.sectionBody}>{t(section.bodyKey)}</Text>
              </View>
            ))}
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
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    marginBottom: 8,
  },
  updated: {
    fontSize: 13,
    lineHeight: 18,
    color: "#94A3B8",
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E3A8A",
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
  },
});
