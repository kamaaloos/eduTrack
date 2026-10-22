import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDashboardLogout } from "../../components/dashboard/DashboardHeader";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { FLOATING_TAB_BAR_INSET } from "../../src/constants/tabBar";
import { AuthContext } from "../../src/context/authContext";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";

type MoreItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
};

export default function StudentMoreScreen() {
  const { t } = useTranslation();
  const { logout } = useContext(AuthContext);
  const handleLogout = useDashboardLogout(logout);
  const { theme, fontFamily } = useSchoolTheme();
  const primary = theme.primaryColor;

  const items: MoreItem[] = [
    {
      key: "attendance",
      label: t("tabs.student.attendance"),
      icon: "calendar-outline",
      onPress: () => router.push("/(students)/attendance"),
    },
    {
      key: "analytics",
      label: t("tabs.student.analytics"),
      icon: "stats-chart-outline",
      onPress: () => router.push("/(students)/analytics"),
    },
    {
      key: "report-card",
      label: t("tabs.student.reports"),
      icon: "document-text-outline",
      onPress: () => router.push("/(students)/report-card"),
    },
    {
      key: "homeworks",
      label: t("student.homework"),
      icon: "book-outline",
      onPress: () => router.push("/(students)/homeworks"),
    },
    {
      key: "exams",
      label: t("student.upcomingExams"),
      icon: "school-outline",
      onPress: () => router.push("/(students)/exams"),
    },
    {
      key: "remarks",
      label: t("student.viewRemarks"),
      icon: "chatbox-ellipses-outline",
      onPress: () => router.push("/(students)/remarks"),
    },
    {
      key: "notifications",
      label: t("notifications.title"),
      icon: "notifications-outline",
      onPress: () => router.push("/(students)/notifications"),
    },
    {
      key: "profile",
      label: t("tabs.student.profile"),
      icon: "person-circle-outline",
      onPress: () => router.push("/(students)/account"),
    },
    {
      key: "logout",
      label: t("common.logout"),
      icon: "log-out-outline",
      onPress: handleLogout,
      destructive: true,
    },
  ];

  return (
    <StudentScreenShell
      title={t("tabs.student.more")}
      showMenu={false}
      contentContainerStyle={{ paddingBottom: FLOATING_TAB_BAR_INSET + 24 }}
    >
      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.key}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.row,
              pressed ? styles.rowPressed : null,
              item.destructive ? styles.rowDestructive : null,
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: item.destructive
                    ? "#FEE2E2"
                    : `${primary}14`,
                },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={item.destructive ? "#B91C1C" : primary}
              />
            </View>
            <Text
              style={[
                styles.label,
                fontFamily ? { fontFamily } : null,
                item.destructive ? styles.labelDestructive : null,
              ]}
            >
              {item.label}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={item.destructive ? "#FCA5A5" : "#94A3B8"}
            />
          </Pressable>
        ))}
      </View>
    </StudentScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowDestructive: {
    borderColor: "#FECACA",
    backgroundColor: "#FFF7F7",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  labelDestructive: {
    color: "#B91C1C",
  },
});
