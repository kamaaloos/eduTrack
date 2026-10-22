import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

type TeacherDashboardBannersProps = {
  pendingAbsenceCount?: number;
};

function ThemedLinkBanner({
  title,
  subtitle,
  icon,
  baseIsPrimary,
  badgeCount,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  baseIsPrimary: boolean;
  badgeCount?: number;
  onPress: () => void;
}) {
  const { theme, fontFamily } = useSchoolTheme();
  const [hovered, setHovered] = useState(false);
  const bg = hovered
    ? baseIsPrimary
      ? theme.accentColor
      : theme.primaryColor
    : baseIsPrimary
      ? theme.primaryColor
      : theme.accentColor;

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.linkBanner,
        localStyles.banner,
        {
          backgroundColor: bg,
          borderColor: bg,
          transform: [{ scale: pressed ? 0.98 : hovered ? 1.02 : 1 }],
          ...(Platform.OS === "web"
            ? ({
                cursor: "pointer",
                transitionProperty: "transform, background-color, box-shadow",
                transitionDuration: "160ms",
                transitionTimingFunction: "ease-out",
                boxShadow: hovered
                  ? `0 12px 28px ${bg}66`
                  : `0 4px 14px rgba(15, 23, 42, 0.12)`,
              } as object)
            : null),
        },
      ]}
    >
      {badgeCount && badgeCount > 0 ? (
        <View style={styles.actionBadge}>
          <Text style={styles.actionBadgeText}>{badgeCount}</Text>
        </View>
      ) : null}
      <View style={localStyles.iconWrap}>
        <Ionicons name={icon} size={22} color="#FFFFFF" />
      </View>
      <View style={styles.linkBannerText}>
        <Text
          style={[
            styles.linkBannerTitle,
            localStyles.title,
            fontFamily ? { fontFamily } : null,
          ]}
        >
          {title}
        </Text>
        <Text style={[styles.linkBannerSub, localStyles.sub]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.85)" />
    </Pressable>
  );
}

export function TeacherDashboardBanners({
  pendingAbsenceCount = 0,
}: TeacherDashboardBannersProps) {
  const { t } = useTranslation();

  return (
    <>
      <ThemedLinkBanner
        title={t("teacher.dashboard.examGradesTitle")}
        subtitle={t("teacher.dashboard.examGradesSub")}
        icon="bar-chart-outline"
        baseIsPrimary
        onPress={() => router.push("/(teachers)/exam-reports")}
      />
      <ThemedLinkBanner
        title={t("teacher.dashboard.absenceReportsTitle")}
        subtitle={t("teacher.dashboard.absenceReportsSub")}
        icon="medkit-outline"
        baseIsPrimary={false}
        badgeCount={pendingAbsenceCount}
        onPress={() => router.push("/(teachers)/absence-reports")}
      />
    </>
  );
}

const localStyles = StyleSheet.create({
  banner: {
    borderWidth: 0,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    color: "#FFFFFF",
  },
  sub: {
    color: "rgba(255,255,255,0.88)",
  },
});
