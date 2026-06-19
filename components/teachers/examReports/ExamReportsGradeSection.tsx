import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import type { ExamResultRecord } from "../../../src/services/examResults";
import type { TeacherStudent } from "../../../src/services/teacherStudents";
import type { usePaginatedList } from "../../../hooks/usePaginatedList";
import { Selector } from "../../admin/Selector";
import { ListPageNav } from "../../common/ListPageNav";
import type { ClassExam } from "./examReportsTypes";
import { ExamReportsStudentGradeRow } from "./ExamReportsStudentGradeRow";
import { examReportsStyles as styles } from "./examReportsStyles";

type StudentPagination = ReturnType<typeof usePaginatedList<TeacherStudent>>;

type ExamReportsGradeSectionProps = {
  exams: ClassExam[];
  examSelectorItems: { id: string; name: string }[];
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
  gradePagination: StudentPagination;
};
export function ExamReportsGradeFixedHeader({
  exams,
  examSelectorItems,
  selectedExamId,
  onSelectExam,
  selectedExam,
  maxMarks,
  gradedCount,
  classAverage,
  studentsInClass,
}: Pick<
  ExamReportsGradeSectionProps,
  | "exams"
  | "examSelectorItems"
  | "selectedExamId"
  | "onSelectExam"
  | "selectedExam"
  | "maxMarks"
  | "gradedCount"
  | "classAverage"
  | "studentsInClass"
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
    <View style={styles.examStatsRow}>
      <View style={styles.examPickerCol}>
        <Selector
          title={t("common.exams")}
          items={examSelectorItems}
          selectedId={selectedExamId}
          onSelect={onSelectExam}
          searchable={examSelectorItems.length > 3}
          searchPlaceholder={t("teacher.examReports.searchExams")}
          visibleLimit={6}
          containerStyle={styles.examPickerSelector}
        />
      </View>

      {selectedExam ? (
        <View style={styles.summaryCol}>
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
        </View>
      ) : null}
    </View>
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
  gradePagination,
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
  | "gradePagination"
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
          shown: gradePagination.rangeEnd,
          total: studentsInClass.length,
        })}
      </Text>
      <View style={styles.listPagination}>
        <ListPageNav
          page={gradePagination.page}
          totalPages={gradePagination.totalPages}
          canPrev={gradePagination.canPrev}
          canNext={gradePagination.canNext}
          onPrev={gradePagination.prevPage}
          onNext={gradePagination.nextPage}
        />
      </View>
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
    </>
  );
}

export function ExamReportsGradeSection({
  exams,
  examSelectorItems,
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
  gradePagination,
}: ExamReportsGradeSectionProps) {
  return (
    <>
      <ExamReportsGradeFixedHeader
        exams={exams}
        examSelectorItems={examSelectorItems}
        selectedExamId={selectedExamId}
        onSelectExam={onSelectExam}
        selectedExam={selectedExam}
        maxMarks={maxMarks}
        gradedCount={gradedCount}
        classAverage={classAverage}
        studentsInClass={studentsInClass}
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
        gradePagination={gradePagination}
      />
    </>
  );
}
