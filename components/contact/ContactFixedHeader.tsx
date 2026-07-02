import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER_BAR_HEIGHT = 44;

export function contactHeaderTotalHeight(topInset: number): number {
  return topInset + HEADER_BAR_HEIGHT;
}

export function ContactFixedHeader() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrap, { paddingTop: insets.top }]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
        >
          <Ionicons name="chevron-back" size={18} color="#1E3A8A" />
          <Text style={styles.backLinkText}>{t("common.back")}</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {t("contact.title")}
        </Text>
        <View style={styles.trailingSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.9)",
  },
  bar: {
    height: HEADER_BAR_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minWidth: 72,
  },
  backLinkText: {
    color: "#1E3A8A",
    fontWeight: "600",
    fontSize: 15,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    color: "#0C4A6E",
    paddingHorizontal: 8,
  },
  trailingSpacer: {
    minWidth: 72,
  },
});
