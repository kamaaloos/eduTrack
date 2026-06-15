import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import {
  webAdminContentStyle,
  webAdminPagePaddingStyle,
} from "../../src/constants/webLayout";
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
  const layout = usePlatformLayout();
  const showMenuButton = Boolean(onMenuPress) && !layout.isDesktopWeb;

  const iconBtnStyle =
    Platform.OS === "web" ? styles.headerIconButton : styles.headerIconButtonNative;
  const iconColor = Platform.OS === "web" ? "#1E3A8A" : "#FFFFFF";

  const headerInner = (
    <View style={[styles.headerInner, webAdminContentStyle(), webAdminPagePaddingStyle()]}>
      <View style={styles.headerRow}>
        <UserAvatar
          name={displayName}
          photoURL={photoURL}
          size={Platform.OS === "web" ? 48 : 52}
          textColor="#1E3A8A"
          backgroundColor="#FFFFFF"
        />

        <View style={styles.headerTextBlock}>
          <TimeGreeting
            namespace="teacher.dashboard"
            textStyle={styles.greeting}
            iconColor="#BFDBFE"
          />
          <Text style={styles.teacherName} numberOfLines={2}>
            {firstName}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {showMenuButton ? (
            <TouchableOpacity
              style={iconBtnStyle}
              onPress={onMenuPress}
              accessibilityLabel={t("admin.management")}
            >
              <Ionicons name="menu" size={20} color={iconColor} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={iconBtnStyle}
            onPress={() => router.push("/(teachers)/notifications")}
            accessibilityLabel={t("common.alerts")}
          >
            <Ionicons name="notifications-outline" size={20} color={iconColor} />
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
    </View>
  );

  if (Platform.OS === "web") {
    return (
      <SafeAreaView style={styles.headerSafe} edges={["top"]}>
        <View style={styles.header}>{headerInner}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.headerSafe} edges={["top"]}>
      <View style={[styles.header, { paddingTop: 4 }]}>{headerInner}</View>
    </SafeAreaView>
  );
}
