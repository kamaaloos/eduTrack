import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { dashboardStyles as styles } from "./dashboardStyles";

type DashboardSectionHeaderProps = {
  title: string;
  route?: string;
  viewAllLabel: string;
};

export function DashboardSectionHeader({
  title,
  route,
  viewAllLabel,
}: DashboardSectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {route ? (
        <TouchableOpacity
          style={styles.viewAllButton}
          activeOpacity={0.75}
          onPress={() => router.push(route as never)}
        >
          <Text style={styles.viewAllText}>{viewAllLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color="#1D4ED8" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
