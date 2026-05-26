import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import {
  getTimeGreetingParts,
  type TimeGreetingNamespace,
} from "../../src/utils/timeGreeting";

type TimeGreetingProps = {
  namespace?: TimeGreetingNamespace;
  textStyle?: StyleProp<TextStyle>;
  iconColor?: string;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
};

export function TimeGreeting({
  namespace = "dashboard",
  textStyle,
  iconColor = "#E0E7FF",
  iconSize = 16,
  style,
}: TimeGreetingProps) {
  const { t } = useTranslation();
  const { key, icon } = useMemo(() => getTimeGreetingParts(namespace), [namespace]);

  return (
    <View style={[styles.row, style]}>
      <Ionicons name={icon} size={iconSize} color={iconColor} />
      <Text style={[styles.text, textStyle]}>{t(key)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  text: {
    color: "#E0E7FF",
    fontSize: 14,
    fontWeight: "500",
  },
});
