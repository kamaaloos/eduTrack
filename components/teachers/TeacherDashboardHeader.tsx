import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserAvatar } from "../common/UserAvatar";
import { TimeGreeting } from "../dashboard/TimeGreeting";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

type TeacherDashboardHeaderProps = {
  displayName?: string;
  photoURL?: string | null;
  firstName: string;
  alertCount: number;
  onMenuPress?: () => void;
};

export function TeacherDashboardHeader({
  displayName,
  photoURL,
  firstName,
  alertCount,
  onMenuPress,
}: TeacherDashboardHeaderProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerRow}>
        <UserAvatar
          name={displayName}
          photoURL={photoURL}
          size={52}
          textColor="#1E3A8A"
          backgroundColor="#FFFFFF"
        />

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
        {onMenuPress ? (
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={onMenuPress}
            accessibilityLabel={t("admin.management")}
          >
            <Ionicons name="menu-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}

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

      </View>
    </View>
  );
}
