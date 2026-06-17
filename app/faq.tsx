import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppScreenBackground } from "../components/AppScreenBackground";
import { FaqAccordion } from "../components/faq/FaqAccordion";
import { FaqFixedHeader, faqHeaderTotalHeight } from "../components/faq/FaqFixedHeader";
import { WebPageCard } from "../components/layout/WebPageCard";
import { copyrightFooterInset } from "../src/constants/appTheme";

export default function FaqScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const headerHeight = faqHeaderTotalHeight(insets.top);
  const footerInset = copyrightFooterInset(insets.bottom);

  return (
    <AppScreenBackground>
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <FaqFixedHeader />
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
          <WebPageCard variant="wide">
            <Text style={styles.heading}>{t("faq.heading")}</Text>
            <Text style={styles.subtitle}>{t("faq.subtitle")}</Text>
            <FaqAccordion />
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => router.push("/contact")}
              activeOpacity={0.88}
            >
              <Text style={styles.contactBtnText}>{t("faq.contactCta")}</Text>
            </TouchableOpacity>
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
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0C4A6E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    marginBottom: 20,
  },
  contactBtn: {
    marginTop: 24,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  contactBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
