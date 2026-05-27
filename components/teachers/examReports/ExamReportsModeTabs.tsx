import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import type { ExamReportsMode } from "./examReportsTypes";
import { examReportsStyles as styles } from "./examReportsStyles";

type ExamReportsModeTabsProps = {
  mode: ExamReportsMode;
  onModeChange: (mode: ExamReportsMode) => void;
};

export function ExamReportsModeTabs({
  mode,
  onModeChange,
}: ExamReportsModeTabsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.modeRow}>
      <TouchableOpacity
        style={[styles.modeBtn, mode === "grade" && styles.modeBtnActive]}
        onPress={() => onModeChange("grade")}
      >
        <Text
          style={[
            styles.modeBtnText,
            mode === "grade" && styles.modeBtnTextActive,
          ]}
        >
          {t("teacher.examReports.gradeExams")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.modeBtn, mode === "reports" && styles.modeBtnActive]}
        onPress={() => onModeChange("reports")}
      >
        <Text
          style={[
            styles.modeBtnText,
            mode === "reports" && styles.modeBtnTextActive,
          ]}
        >
          {t("teacher.examReports.studentReports")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
