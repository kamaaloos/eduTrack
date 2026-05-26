import { useTranslation } from "react-i18next";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SelectChips } from "../SelectChips";
import { teacherAcademicStyles as styles } from "./teacherAcademicStyles";

type TeacherExamFormProps = {
  allowedSubjects: string[];
  examSubject: string;
  onExamSubjectChange: (value: string) => void;
  examTitle: string;
  onExamTitleChange: (value: string) => void;
  examMarks: string;
  onExamMarksChange: (value: string) => void;
  examDetails: string;
  onExamDetailsChange: (value: string) => void;
  onPublish: () => void;
};

export function TeacherExamForm({
  allowedSubjects,
  examSubject,
  onExamSubjectChange,
  examTitle,
  onExamTitleChange,
  examMarks,
  onExamMarksChange,
  examDetails,
  onExamDetailsChange,
  onPublish,
}: TeacherExamFormProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        📝 {t("teacher.academic.createExam")}
      </Text>

      {allowedSubjects.length > 0 ? (
        <>
          <Text style={styles.fieldLabel}>{t("common.subject")}</Text>
          <SelectChips
            options={allowedSubjects.map((s) => ({ value: s, label: s }))}
            selectedValue={examSubject || allowedSubjects[0]}
            onSelect={onExamSubjectChange}
          />
        </>
      ) : (
        <Text style={styles.subjectWarn}>
          {t("teacher.academic.noSubjectsWarnShort")}
        </Text>
      )}

      <TextInput
        placeholder={t("teacher.academic.examTitlePlaceholder")}
        style={styles.input}
        value={examTitle}
        onChangeText={onExamTitleChange}
      />

      <TextInput
        placeholder={t("teacher.academic.marksPlaceholder")}
        keyboardType="numeric"
        style={styles.input}
        value={examMarks}
        onChangeText={onExamMarksChange}
      />

      <TextInput
        placeholder={t("teacher.academic.examDetailsPlaceholder")}
        style={[styles.input, styles.textArea]}
        value={examDetails}
        onChangeText={onExamDetailsChange}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={onPublish}>
        <Text style={styles.buttonText}>
          {t("teacher.academic.createExamBtn")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
