import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from "react-native";

type AuthAboutLinkProps = {
  style?: ViewStyle;
};

export function AuthAboutLink({ style }: AuthAboutLinkProps) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[styles.link, style]}
      onPress={() => router.push("/about")}
      accessibilityRole="button"
      accessibilityLabel={t("about.title")}
    >
      <Ionicons name="settings-outline" size={18} color="#1E3A8A" />
      <Text style={styles.linkText}>{t("about.shortTitle")}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.85)",
  },
  linkText: {
    color: "#1E3A8A",
    fontSize: 13,
    fontWeight: "700",
  },
});
