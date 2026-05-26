import { ActivityIndicator, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SelectChips } from "../SelectChips";
import { teacherAcademicStyles as styles } from "./teacherAcademicStyles";

type TeacherAcademicClassCardProps = {
  loadingClasses: boolean;
  classesError: string | null | undefined;
  assignedClasses: any[];
  classOptions: { value: string; label: string }[];
  selectedClassId: string;
  onSelectClass: (id: string) => void;
};

export function TeacherAcademicClassCard({
  loadingClasses,
  classesError,
  assignedClasses,
  classOptions,
  selectedClassId,
  onSelectClass,
}: TeacherAcademicClassCardProps) {
  const { t } = useTranslation();

  return (
    <View style={[styles.card, styles.classCard]}>
      <Text style={styles.sectionTitle}>
        📚 {t("teacher.academic.selectClass")}
      </Text>

      {loadingClasses ? (
        <ActivityIndicator style={styles.classLoader} color="#2563EB" />
      ) : classesError ? (
        <Text style={styles.noClassesText}>{classesError}</Text>
      ) : assignedClasses.length === 0 ? (
        <Text style={styles.noClassesText}>
          {t("teacher.academic.noClassesAssigned")}
        </Text>
      ) : (
        <>
          <SelectChips
            options={classOptions}
            selectedValue={selectedClassId || assignedClasses[0]?.id || ""}
            onSelect={onSelectClass}
          />
          <Text style={styles.selectedHint}>
            {t("teacher.academic.classCountHint", {
              count: assignedClasses.length,
            })}
          </Text>
        </>
      )}
    </View>
  );
}
