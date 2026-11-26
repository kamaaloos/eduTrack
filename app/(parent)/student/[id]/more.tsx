import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StudentScreenShell } from "../../../../components/students/StudentScreenShell";
import { useParentChildRoute } from "../../../../hooks/useParentChildRoute";
import { FLOATING_TAB_BAR_INSET } from "../../../../src/constants/tabBar";
import { useSchoolTheme } from "../../../../src/context/schoolThemeContext";

type MoreItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function ParentChildMoreScreen() {
  const { t } = useTranslation();
  const { theme, fontFamily } = useSchoolTheme();
  const primary = theme.primaryColor;
  const { studentId, classId, className, displayName } = useParentChildRoute();

  const items: MoreItem[] = [
    {
      key: "report-card",
      label: t("tabs.student.reports"),
      icon: "document-text-outline",
      onPress: () => router.push("/(parent)/report-card"),
    },
    {
      key: "report-absence",
      label: t("parent.reportAbsenceTitle"),
      icon: "medkit-outline",
      onPress: () =>
        router.push({
          pathname: "/(parent)/report-absence",
          params: {
            studentId,
            studentName: displayName,
            className: className ?? "",
            classId: classId ?? "",
          },
        }),
    },
    {
      key: "notifications",
      label: t("parent.notificationsTitle"),
      icon: "notifications-outline",
      onPress: () => router.push("/(parent)/notifications"),
    },
    {
      key: "complaints",
      label: t("parent.complaintsTitle"),
      icon: "alert-circle-outline",
      onPress: () => router.push("/(parent)/complaints"),
    },
    {
      key: "children",
      label: t("parent.backToChildren"),
      icon: "people-outline",
      onPress: () => router.replace("/(parent)/dashboard"),
    },
    {
      key: "account",
      label: t("tabs.parent.profile"),
      icon: "person-circle-outline",
      onPress: () => router.push("/(parent)/account"),
    },
  ];

  return (
    <StudentScreenShell
      title={t("tabs.student.more")}
      subtitle={displayName}
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
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${primary}14` }]}>
              <Ionicons name={item.icon} size={20} color={primary} />
            </View>
            <Text style={[styles.label, fontFamily ? { fontFamily } : null]}>
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
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
});
