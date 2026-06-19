import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { examReportsStyles as styles } from "./examReportsStyles";

type ExamReportsTopActionsProps = {
  gradedCount: number;
  canExport: boolean;
  exporting: boolean;
  onExportAllCertificates: () => void;
};

export function ExamReportsTopActions({
  gradedCount,
  canExport,
  exporting,
  onExportAllCertificates,
}: ExamReportsTopActionsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.modeRow}>
      <View style={[styles.modeBtn, styles.modeBtnActive]}>
        <Text style={[styles.modeBtnText, styles.modeBtnTextActive]}>
          {t("teacher.examReports.gradeExams")}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.modeBtn,
          styles.exportTabBtn,
          (!canExport || exporting) && styles.exportTabBtnDisabled,
        ]}
        onPress={onExportAllCertificates}
        disabled={!canExport || exporting}
      >
        {exporting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="documents-outline" size={16} color="#FFFFFF" />
            <Text style={styles.exportTabBtnText} numberOfLines={2}>
              {t("teacher.examReports.exportAllCertificatesPdf", {
                count: gradedCount,
              })}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
