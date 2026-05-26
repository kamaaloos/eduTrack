import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Selector } from "../../admin/Selector";
import { SelectChips } from "../SelectChips";
import { teacherAcademicStyles as styles } from "./teacherAcademicStyles";

type TeacherRemarkFormProps = {
  selectedClassId: string;
  loadingStudents: boolean;
  students: any[];
  studentSelectorItems: { id: string; name: string }[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  remarkText: string;
  onRemarkTextChange: (value: string) => void;
  remarkTypeOptions: { value: string; label: string }[];
  remarkType: string;
  onRemarkTypeChange: (value: string) => void;
  rating: string;
  onRatingChange: (value: string) => void;
  onPublish: () => void;
};

export function TeacherRemarkForm({
  selectedClassId,
  loadingStudents,
  students,
  studentSelectorItems,
  selectedStudentId,
  onSelectStudent,
  remarkText,
  onRemarkTextChange,
  remarkTypeOptions,
  remarkType,
  onRemarkTypeChange,
  rating,
  onRatingChange,
  onPublish,
}: TeacherRemarkFormProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        ⭐ {t("teacher.academic.addRemark")}
      </Text>
      <Text style={styles.selectedHint}>
        {t("teacher.academic.remarkClassHint")}
      </Text>

      {loadingStudents ? (
        <ActivityIndicator color="#2563EB" style={styles.classLoader} />
      ) : !selectedClassId ? (
        <Text style={styles.loadingText}>
          {t("teacher.academic.selectClassFirst")}
        </Text>
      ) : (
        <Selector
          title={t("common.student")}
          items={studentSelectorItems}
          selectedId={selectedStudentId}
          searchable
          searchPlaceholder={t("teacher.academic.searchStudents")}
          onSelect={onSelectStudent}
        />
      )}

      {students.length === 0 && selectedClassId && !loadingStudents ? (
        <Text style={styles.loadingText}>
          {t("teacher.academic.noStudentsInClass")}
        </Text>
      ) : null}

      <TextInput
        placeholder={t("teacher.academic.remarkPlaceholder")}
        style={[styles.input, { height: 120 }]}
        multiline
        value={remarkText}
        onChangeText={onRemarkTextChange}
      />

      <Text style={styles.pickerLabel}>{t("teacher.academic.remarkType")}</Text>
      <SelectChips
        options={remarkTypeOptions}
        selectedValue={remarkType || "performance"}
        onSelect={onRemarkTypeChange}
      />

      <Text style={styles.pickerLabel}>
        {t("teacher.academic.ratingOptional")}
      </Text>
      <Text style={styles.fieldHint}>{t("teacher.academic.ratingHint")}</Text>
      <TextInput
        placeholder={t("teacher.academic.ratingPlaceholder")}
        keyboardType="numeric"
        style={styles.input}
        value={rating}
        onChangeText={onRatingChange}
        maxLength={1}
      />

      <TouchableOpacity style={styles.button} onPress={onPublish}>
        <Text style={styles.buttonText}>
          {t("teacher.academic.publishRemarkBtn")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
