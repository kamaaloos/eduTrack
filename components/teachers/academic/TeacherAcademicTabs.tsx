import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity } from "react-native";
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
  return (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === value && styles.activeTab]}
      onPress={() => onPress(value)}
    >
      <Text style={[styles.tabText, activeTab === value && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
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
