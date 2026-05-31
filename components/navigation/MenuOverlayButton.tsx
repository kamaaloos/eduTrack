import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MenuOverlayButtonProps = {
  onPress: () => void;
  align?: "left" | "right";
};

export function MenuOverlayButton({
  onPress,
  align = "right",
}: MenuOverlayButtonProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        align === "right" ? styles.buttonRight : styles.buttonLeft,
        { top: insets.top + 10 },
      ]}
      onPress={onPress}
      accessibilityLabel={t("admin.management")}
      accessibilityRole="button"
    >
      <Ionicons name="menu" size={22} color="#1E3A8A" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    zIndex: 200,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonLeft: {
    left: 16,
  },
  buttonRight: {
    right: 16,
  },
});
