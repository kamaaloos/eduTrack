import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { SelectChips } from "./SelectChips";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

type ChipOption = { value: string; label: string };

type TeacherDashboardClassesSectionProps = {
  classChipOptions: ChipOption[];
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
};

export function TeacherDashboardClassesSection({
  classChipOptions,
  selectedClassId,
  onSelectClass,
}: TeacherDashboardClassesSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {t("teacher.dashboard.assignedClasses")}
        </Text>
        <Text style={styles.sectionHint}>
          {t("teacher.dashboard.tapClassHint")}
        </Text>
      </View>

      {classChipOptions.length === 0 ? (
        <Text style={styles.emptyHint}>{t("teacher.dashboard.noClasses")}</Text>
      ) : (
        <SelectChips
          options={classChipOptions}
          selectedValue={selectedClassId}
          onSelect={onSelectClass}
        />
      )}
    </View>
  );
}
