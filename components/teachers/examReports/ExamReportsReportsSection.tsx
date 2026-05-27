import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import type { TeacherStudent } from "../../../src/services/teacherStudents";
import { ExamReportsShowMore } from "./ExamReportsShowMore";
import { examReportsStyles as styles } from "./examReportsStyles";

type ExamReportsReportsSectionProps = {
  reportSearch: string;
  onReportSearchChange: (text: string) => void;
  filteredReportStudents: TeacherStudent[];
  visibleReportStudents: TeacherStudent[];
  onOpenReport: (student: TeacherStudent) => void;
  onShowMore: () => void;
};

export function ExamReportsReportsSection({
  reportSearch,
  onReportSearchChange,
  filteredReportStudents,
  visibleReportStudents,
  onOpenReport,
  onShowMore,
}: ExamReportsReportsSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <TextInput
        style={styles.search}
        placeholder={t("teacher.examReports.searchStudents")}
        value={reportSearch}
        onChangeText={onReportSearchChange}
      />

      {filteredReportStudents.length === 0 ? (
        <Text style={styles.emptySub}>
          {t("teacher.examReports.noSearchMatch")}
        </Text>
      ) : (
        <>
          <Text style={styles.listHint}>
            {t("teacher.examReports.showingStudents", {
              shown: visibleReportStudents.length,
              total: filteredReportStudents.length,
            })}
          </Text>
          {visibleReportStudents.map((student) => (
            <TouchableOpacity
              key={student.id}
              style={styles.reportRow}
              onPress={() => onOpenReport(student)}
              activeOpacity={0.85}
            >
              <View style={styles.reportAvatar}>
                <Text style={styles.reportAvatarText}>
                  {(student.name || "S").charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.reportRowText}>
                <Text style={styles.studentName}>
                  {student.name || t("common.student")}
                </Text>
                <Text style={styles.reportRowSub}>
                  {t("teacher.examReports.reportRowSub")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          ))}
          <ExamReportsShowMore
            shown={visibleReportStudents.length}
            total={filteredReportStudents.length}
            onPress={onShowMore}
          />
        </>
      )}
    </>
  );
}
