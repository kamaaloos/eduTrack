import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

type TeacherDashboardStatsProps = {
  classCount: number;
  studentCount: number;
};

function ThemedStatCard({
  label,
  value,
  baseIsPrimary,
}: {
  label: string;
  value: number;
  baseIsPrimary: boolean;
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
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.statCard,
        localStyles.statCardThemed,
        {
          backgroundColor: bg,
          borderColor: bg,
          transform: [{ scale: pressed ? 0.97 : hovered ? 1.05 : 1 }],
          ...(Platform.OS === "web"
            ? ({
                cursor: "default",
                transitionProperty: "transform, background-color, box-shadow",
                transitionDuration: "160ms",
                transitionTimingFunction: "ease-out",
                boxShadow: hovered
                  ? `0 12px 26px ${bg}66`
                  : `0 3px 10px rgba(15, 23, 42, 0.12)`,
              } as object)
            : null),
        },
      ]}
    >
      <Text
        style={[
          styles.statValue,
          localStyles.statValueThemed,
          fontFamily ? { fontFamily } : null,
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.statLabel,
          localStyles.statLabelThemed,
          fontFamily ? { fontFamily } : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TeacherDashboardStats({
  classCount,
  studentCount,
}: TeacherDashboardStatsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.statsContainer}>
      <ThemedStatCard
        label={t("teacher.dashboard.classes")}
        value={classCount}
        baseIsPrimary
      />
      <ThemedStatCard
        label={t("teacher.dashboard.students")}
        value={studentCount}
        baseIsPrimary={false}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  statCardThemed: {
    borderWidth: 0,
  },
  statValueThemed: {
    color: "#FFFFFF",
  },
  statLabelThemed: {
    color: "rgba(255,255,255,0.9)",
  },
});
