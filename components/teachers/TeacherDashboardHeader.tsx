import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TimeGreeting } from "../dashboard/TimeGreeting";
import { useDashboardLogout } from "../dashboard/DashboardHeader";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

type TeacherDashboardHeaderProps = {
  initials: string;
  firstName: string;
  alertCount: number;
  onLogout: () => Promise<void>;
};

export function TeacherDashboardHeader({
  initials,
  firstName,
  alertCount,
  onLogout,
}: TeacherDashboardHeaderProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const handleLogout = useDashboardLogout(onLogout);

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.headerTextBlock}>
          <TimeGreeting
            namespace="teacher.dashboard"
            textStyle={styles.greeting}
            iconColor="#DBEAFE"
          />
          <Text style={styles.teacherName} numberOfLines={2}>
            {firstName}
          </Text>
        </View>
      </View>

      <View style={styles.headerActionsRow}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.push("/(teachers)/notifications")}
          accessibilityLabel={t("common.alerts")}
        >
          <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          {alertCount > 0 ? (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {alertCount > 9 ? "9+" : alertCount}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityLabel={t("common.logout")}
        >
          <Ionicons name="log-out-outline" size={20} color="#1E3A8A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
