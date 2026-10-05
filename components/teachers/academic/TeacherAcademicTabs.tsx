import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, ScrollView, Text } from "react-native";
import { useSchoolTheme } from "../../../src/context/schoolThemeContext";
import type { AcademicTab } from "./teacherAcademicTypes";
import { teacherAcademicStyles as styles } from "./teacherAcademicStyles";

type TeacherAcademicTabsProps = {
  activeTab: AcademicTab;
  onTabChange: (tab: AcademicTab) => void;
};

function TabButton({
  title,
  value,
  activeTab,
  onPress,
}: {
  title: string;
  value: AcademicTab;
  activeTab: AcademicTab;
  onPress: (tab: AcademicTab) => void;
}) {
  const { theme } = useSchoolTheme();
  const [hovered, setHovered] = useState(false);
  const isActive = activeTab === value;
  const backgroundColor = isActive
    ? hovered
      ? theme.accentColor
      : theme.primaryColor
    : "white";

  return (
    <Pressable
      style={[
        styles.tabButton,
        isActive && { backgroundColor },
        Platform.OS === "web" && !isActive
          ? ({ cursor: "pointer" } as object)
          : null,
      ]}
      onPress={() => onPress(value)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {title}
      </Text>
    </Pressable>
  );
}

export function TeacherAcademicTabs({
  activeTab,
  onTabChange,
}: TeacherAcademicTabsProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabsRow}
    >
      <TabButton
        title={t("common.homework")}
        value="homework"
        activeTab={activeTab}
        onPress={onTabChange}
      />
      <TabButton
        title={t("common.exams")}
        value="exams"
        activeTab={activeTab}
        onPress={onTabChange}
      />
      <TabButton
        title={t("common.remarks")}
        value="remarks"
        activeTab={activeTab}
        onPress={onTabChange}
      />
      <TabButton
        title={t("common.announcements")}
        value="announcements"
        activeTab={activeTab}
        onPress={onTabChange}
      />
    </ScrollView>
  );
}
