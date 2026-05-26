import { useTranslation } from "react-i18next";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SelectChips } from "../SelectChips";
import { teacherAcademicStyles as styles } from "./teacherAcademicStyles";

type TeacherHomeworkFormProps = {
  allowedSubjects: string[];
  hwSubject: string;
  onHwSubjectChange: (value: string) => void;
  hwTitle: string;
  onHwTitleChange: (value: string) => void;
  hwDaysLeft: string;
  onHwDaysLeftChange: (value: string) => void;
  hwDetails: string;
  onHwDetailsChange: (value: string) => void;
  onPublish: () => void;
};

export function TeacherHomeworkForm({
  allowedSubjects,
  hwSubject,
  onHwSubjectChange,
  hwTitle,
  onHwTitleChange,
  hwDaysLeft,
  onHwDaysLeftChange,
  hwDetails,
  onHwDetailsChange,
  onPublish,
}: TeacherHomeworkFormProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        📖 {t("teacher.academic.publishHomework")}
      </Text>

      {allowedSubjects.length > 0 ? (
        <>
          <Text style={styles.fieldLabel}>{t("common.subject")}</Text>
          <SelectChips
            options={allowedSubjects.map((s) => ({ value: s, label: s }))}
            selectedValue={hwSubject || allowedSubjects[0]}
            onSelect={onHwSubjectChange}
          />
        </>
      ) : (
        <Text style={styles.subjectWarn}>
          {t("teacher.academic.noSubjectsWarn")}
        </Text>
      )}

      <TextInput
        placeholder={t("teacher.academic.hwTitlePlaceholder")}
        style={styles.input}
        value={hwTitle}
        onChangeText={onHwTitleChange}
      />

      <TextInput
        placeholder={t("teacher.academic.daysLeftPlaceholder")}
        keyboardType="numeric"
        style={styles.input}
        value={hwDaysLeft}
        onChangeText={onHwDaysLeftChange}
      />

      <TextInput
        placeholder={t("teacher.academic.hwDetailsPlaceholder")}
        style={[styles.input, styles.textArea]}
        value={hwDetails}
        onChangeText={onHwDetailsChange}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={onPublish}>
        <Text style={styles.buttonText}>
          {t("teacher.academic.publishHomeworkBtn")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
