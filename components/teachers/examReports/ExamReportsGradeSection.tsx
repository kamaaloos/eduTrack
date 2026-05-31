import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ExamResultRecord } from "../../../src/services/examResults";
import type { TeacherStudent } from "../../../src/services/teacherStudents";
import { SelectChips } from "../SelectChips";
import type { ClassExam } from "./examReportsTypes";
import { ExamReportsShowMore } from "./ExamReportsShowMore";
import { ExamReportsStudentGradeRow } from "./ExamReportsStudentGradeRow";
import { examReportsStyles as styles } from "./examReportsStyles";

type ExamReportsGradeSectionProps = {
  exams: ClassExam[];
  examChipOptions: { value: string; label: string }[];
  selectedExamId: string;
  onSelectExam: (id: string) => void;
  selectedExam?: ClassExam;
  maxMarks: number | null;
  gradedCount: number;
  classAverage: number | null;
  studentsInClass: TeacherStudent[];
  visibleGradeStudents: TeacherStudent[];
  resultByStudent: Map<string, ExamResultRecord>;
  scoreDrafts: Record<string, string>;
  savingId: string | null;
  onScoreChange: (studentId: string, text: string) => void;
  onSaveScore: (student: TeacherStudent) => void;
  onOpenReport: (student: TeacherStudent) => void;
  onExportCertificate: (student: TeacherStudent) => void;
  onExportAllCertificates?: () => void;
  exportingAllCertificates?: boolean;
  onShowMore: () => void;
};

export function ExamReportsGradeFixedHeader({
  exams,
  examChipOptions,
  selectedExamId,
  onSelectExam,
  selectedExam,
  maxMarks,
  gradedCount,
  classAverage,
  studentsInClass,
  onExportAllCertificates,
  exportingAllCertificates,
}: Pick<
  ExamReportsGradeSectionProps,
  | "exams"
  | "examChipOptions"
  | "selectedExamId"
  | "onSelectExam"
  | "selectedExam"
  | "maxMarks"
  | "gradedCount"
  | "classAverage"
  | "studentsInClass"
  | "onExportAllCertificates"
  | "exportingAllCertificates"
>) {
  const { t } = useTranslation();

  if (exams.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>{t("teacher.examReports.noExams")}</Text>
        <Text style={styles.emptySub}>{t("teacher.examReports.noExamsSub")}</Text>
      </View>
    );
  }

  return (
    <>
      <Text style={styles.label}>{t("common.exams")}</Text>
      <SelectChips
        options={examChipOptions}
        selectedValue={selectedExamId}
        onSelect={onSelectExam}
      />

      {selectedExam ? (
        <View style={styles.summaryRow}>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryLabel}>
              {t("teacher.examReports.graded")}
            </Text>
            <Text style={styles.summaryValue}>
              {gradedCount}/{studentsInClass.length}
            </Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryLabel}>
              {t("teacher.examReports.classAvg")}
            </Text>
            <Text style={styles.summaryValue}>
              {classAverage != null
                ? maxMarks != null
                  ? `${classAverage}/${maxMarks}`
                  : `${classAverage}%`
                : "—"}
            </Text>
          </View>
          {maxMarks != null ? (
            <View style={styles.summaryChip}>
              <Text style={styles.summaryLabel}>
                {t("teacher.examReports.outOf")}
              </Text>
              <Text style={styles.summaryValue}>{maxMarks}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {selectedExam && gradedCount > 0 && onExportAllCertificates ? (
        <TouchableOpacity
          style={[styles.exportAllBtn, exportingAllCertificates && styles.exportAllBtnDisabled]}
          onPress={onExportAllCertificates}
          disabled={exportingAllCertificates}
        >
          {exportingAllCertificates ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="documents-outline" size={18} color="#FFFFFF" />
              <Text style={styles.exportAllBtnText}>
                {t("teacher.examReports.exportAllCertificatesPdf", {
                  count: gradedCount,
                })}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : null}
    </>
  );
}

export function ExamReportsGradeStudentList({
  studentsInClass,
  visibleGradeStudents,
  resultByStudent,
  maxMarks,
  scoreDrafts,
  savingId,
  onScoreChange,
  onSaveScore,
  onOpenReport,
  onExportCertificate,
  onShowMore,
}: Pick<
  ExamReportsGradeSectionProps,
  | "studentsInClass"
  | "visibleGradeStudents"
  | "resultByStudent"
  | "maxMarks"
  | "scoreDrafts"
  | "savingId"
  | "onScoreChange"
  | "onSaveScore"
  | "onOpenReport"
  | "onExportCertificate"
  | "onShowMore"
>) {
  const { t } = useTranslation();

  if (studentsInClass.length === 0) {
    return (
      <Text style={styles.emptySub}>
        {t("teacher.examReports.noStudentsInClass")}
      </Text>
    );
  }

  return (
    <>
      <Text style={styles.listHint}>
        {t("teacher.examReports.showingStudents", {
          shown: visibleGradeStudents.length,
          total: studentsInClass.length,
        })}
      </Text>
      {visibleGradeStudents.map((student) => (
        <ExamReportsStudentGradeRow
          key={student.id}
          student={student}
          result={resultByStudent.get(student.id)}
          maxMarks={maxMarks}
          scoreDraft={scoreDrafts[student.id] ?? ""}
          saving={savingId === student.id}
          onScoreChange={(text) => onScoreChange(student.id, text)}
          onSave={() => onSaveScore(student)}
          onOpenReport={() => onOpenReport(student)}
          onExportCertificate={() => onExportCertificate(student)}
        />
      ))}
      <ExamReportsShowMore
        shown={visibleGradeStudents.length}
        total={studentsInClass.length}
        onPress={onShowMore}
      />
    </>
  );
}

export function ExamReportsGradeSection({
  exams,
  examChipOptions,
  selectedExamId,
  onSelectExam,
  selectedExam,
  maxMarks,
  gradedCount,
  classAverage,
  studentsInClass,
  visibleGradeStudents,
  resultByStudent,
  scoreDrafts,
  savingId,
  onScoreChange,
  onSaveScore,
  onOpenReport,
  onExportCertificate,
  onExportAllCertificates,
  exportingAllCertificates,
  onShowMore,
}: ExamReportsGradeSectionProps) {
  return (
    <>
      <ExamReportsGradeFixedHeader
        exams={exams}
        examChipOptions={examChipOptions}
        selectedExamId={selectedExamId}
        onSelectExam={onSelectExam}
        selectedExam={selectedExam}
        maxMarks={maxMarks}
        gradedCount={gradedCount}
        classAverage={classAverage}
        studentsInClass={studentsInClass}
        onExportAllCertificates={onExportAllCertificates}
        exportingAllCertificates={exportingAllCertificates}
      />
      <ExamReportsGradeStudentList
        studentsInClass={studentsInClass}
        visibleGradeStudents={visibleGradeStudents}
        resultByStudent={resultByStudent}
        maxMarks={maxMarks}
        scoreDrafts={scoreDrafts}
        savingId={savingId}
        onScoreChange={onScoreChange}
        onSaveScore={onSaveScore}
        onOpenReport={onOpenReport}
        onExportCertificate={onExportCertificate}
        onShowMore={onShowMore}
      />
    </>
  );
}
