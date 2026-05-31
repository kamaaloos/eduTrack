import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { useTeacherExamReports } from "../../hooks/useTeacherExamReports";
import { SelectChips } from "./SelectChips";
import {
  ExamReportsGradeFixedHeader,
  ExamReportsGradeStudentList,
} from "./examReports/ExamReportsGradeSection";
import { ExamReportsModeTabs } from "./examReports/ExamReportsModeTabs";
import {
  ExamReportsReportsSearch,
  ExamReportsReportsStudentList,
} from "./examReports/ExamReportsReportsSection";
import { examReportsStyles as styles } from "./examReports/examReportsStyles";

export type TeacherExamReportsViewProps = ReturnType<
  typeof useTeacherExamReports
>;

export function TeacherExamReportsView(props: TeacherExamReportsViewProps) {
  const { t } = useTranslation();
  const {
    classesLoading,
    classes,
    classOptions,
    selectedClassId,
    setSelectedClassId,
    mode,
    setMode,
    loading,
    refreshing,
    onRefresh,
    exams,
    selectedExamId,
    setSelectedExamId,
    selectedExam,
    maxMarks,
    examChipOptions,
    studentsInClass,
    gradedCount,
    classAverage,
    visibleGradeStudents,
    visibleReportStudents,
    filteredReportStudents,
    resultByStudent,
    scoreDrafts,
    savingId,
    reportSearch,
    setReportSearch,
    updateScoreDraft,
    saveScore,
    openReport,
    exportCertificate,
    exportAllCertificates,
    exportingAllCertificates,
    showMoreGradeStudents,
    showMoreReportStudents,
  } = props;

  if (classesLoading || (loading && classes.length === 0)) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (classes.length === 0) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <Text style={styles.emptyTitle}>
          {t("teacher.examReports.noClassesAssigned")}
        </Text>
        <Text style={styles.emptySub}>{t("teacher.examReports.noClassesSub")}</Text>
      </SafeAreaView>
    );
  }

  const showGradeStudents = mode === "grade" && exams.length > 0;
  const showReportStudents = mode === "reports";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.fixedTop}>
        <Text style={styles.pageTitle}>{t("teacher.examReports.pageTitle")}</Text>
        <Text style={styles.pageSub}>{t("teacher.examReports.pageSub")}</Text>

        <Text style={styles.label}>{t("common.class")}</Text>
        <SelectChips
          options={classOptions}
          selectedValue={selectedClassId}
          onSelect={setSelectedClassId}
        />

        <ExamReportsModeTabs mode={mode} onModeChange={setMode} />

        {loading ? (
          <ActivityIndicator style={styles.loader} color="#2563EB" />
        ) : mode === "grade" ? (
          <ExamReportsGradeFixedHeader
            exams={exams}
            examChipOptions={examChipOptions}
            selectedExamId={selectedExamId}
            onSelectExam={setSelectedExamId}
            selectedExam={selectedExam}
            maxMarks={maxMarks}
            gradedCount={gradedCount}
            classAverage={classAverage}
            studentsInClass={studentsInClass}
            onExportAllCertificates={() => void exportAllCertificates()}
            exportingAllCertificates={exportingAllCertificates}
          />
        ) : (
          <ExamReportsReportsSearch
            reportSearch={reportSearch}
            onReportSearchChange={setReportSearch}
          />
        )}
      </View>

      {!loading && (showGradeStudents || showReportStudents) ? (
        <ScrollView
          style={styles.studentScroll}
          contentContainerStyle={styles.studentScrollContent}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {mode === "grade" ? (
            <ExamReportsGradeStudentList
              studentsInClass={studentsInClass}
              visibleGradeStudents={visibleGradeStudents}
              resultByStudent={resultByStudent}
              maxMarks={maxMarks}
              scoreDrafts={scoreDrafts}
              savingId={savingId}
              onScoreChange={updateScoreDraft}
              onSaveScore={saveScore}
              onOpenReport={openReport}
              onExportCertificate={exportCertificate}
              onShowMore={showMoreGradeStudents}
            />
          ) : (
            <ExamReportsReportsStudentList
              filteredReportStudents={filteredReportStudents}
              visibleReportStudents={visibleReportStudents}
              onOpenReport={openReport}
              onShowMore={showMoreReportStudents}
            />
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
