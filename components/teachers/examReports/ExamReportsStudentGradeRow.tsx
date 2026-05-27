import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { ExamResultRecord } from "../../../src/services/examResults";
import type { TeacherStudent } from "../../../src/services/teacherStudents";
import { examReportsStyles as styles } from "./examReportsStyles";
import { scoreLabel } from "./examReportsUtils";

type ExamReportsStudentGradeRowProps = {
  student: TeacherStudent;
  result?: ExamResultRecord;
  maxMarks: number | null;
  scoreDraft: string;
  saving: boolean;
  onScoreChange: (text: string) => void;
  onSave: () => void;
  onOpenReport: () => void;
};

export function ExamReportsStudentGradeRow({
  student,
  result,
  maxMarks,
  scoreDraft,
  saving,
  onScoreChange,
  onSave,
  onOpenReport,
}: ExamReportsStudentGradeRowProps) {
  const { t } = useTranslation();
  const graded = Boolean(result?.graded);
  const parentSeen = Boolean(result?.parentSeenAt);

  return (
    <View style={styles.studentRow}>
      <View style={styles.studentRowTop}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {student.name || t("common.student")}
          </Text>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                graded ? styles.badgeGraded : styles.badgePending,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  graded ? styles.badgeTextGraded : styles.badgeTextPending,
                ]}
              >
                {graded
                  ? scoreLabel(result?.score ?? null, maxMarks)
                  : t("teacher.examReports.notGraded")}
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                parentSeen ? styles.badgeSeen : styles.badgeUnseen,
              ]}
            >
              <Ionicons
                name={parentSeen ? "eye" : "eye-off-outline"}
                size={12}
                color={parentSeen ? "#059669" : "#B45309"}
              />
              <Text
                style={[
                  styles.badgeText,
                  parentSeen ? styles.badgeTextSeen : styles.badgeTextUnseen,
                ]}
              >
                {parentSeen
                  ? t("teacher.examReports.parentSaw")
                  : t("teacher.examReports.notSeen")}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={onOpenReport} style={styles.reportLink}>
          <Text style={styles.reportLinkText}>
            {t("teacher.examReports.report")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scoreRow}>
        <TextInput
          style={styles.scoreInput}
          placeholder={maxMarks != null ? `0–${maxMarks}` : "0–100"}
          keyboardType="numeric"
          value={scoreDraft}
          onChangeText={onScoreChange}
        />
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={onSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>{t("common.save")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
