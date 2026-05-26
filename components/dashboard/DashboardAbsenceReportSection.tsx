import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { submitParentAbsenceReport } from "../../src/services/parentAbsence";
import { DashboardSectionHeader } from "./DashboardSectionHeader";
import { dashboardStyles as styles } from "./dashboardStyles";

type DashboardAbsenceReportSectionProps = {
  parentId: string;
  studentId: string;
  classId: string | null;
};

export function DashboardAbsenceReportSection({
  parentId,
  studentId,
  classId,
}: DashboardAbsenceReportSectionProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  const submitAbsence = async () => {
    if (!reason.trim()) {
      Alert.alert(t("parent.reportAbsenceReason"));
      return;
    }
    try {
      await submitParentAbsenceReport({
        parentId,
        studentId,
        reasonCode: "other",
        notes: reason.trim(),
        classId: classId || undefined,
      });
      setReason("");
      Alert.alert(t("common.success"), t("parent.reportAbsenceSuccess"));
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error ? err.message : t("parent.reportAbsenceError"),
      );
    }
  };

  return (
    <View style={styles.section}>
      <DashboardSectionHeader
        title={`📋 ${t("parent.reportAbsenceTitle")}`}
        viewAllLabel={t("common.seeAll")}
      />
      <View style={styles.absenceCard}>
        <TextInput
          placeholder={t("parent.reportAbsenceReason")}
          value={reason}
          onChangeText={setReason}
          style={styles.absenceInput}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.absenceButton} onPress={submitAbsence}>
          <Text style={styles.absenceButtonText}>
            {t("parent.reportAbsenceSubmit")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
