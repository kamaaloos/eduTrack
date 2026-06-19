import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { useTeacherExamReports } from "../../hooks/useTeacherExamReports";
import { SelectChips } from "./SelectChips";
import { TeacherScreenShell } from "./TeacherScreenShell";
import {
  ExamReportsGradeFixedHeader,
  ExamReportsGradeStudentList,
} from "./examReports/ExamReportsGradeSection";
import { ExamReportsKeyboardAccessory } from "./examReports/ExamReportsKeyboardAccessory";
import { ExamReportsTopActions } from "./examReports/ExamReportsModeTabs";
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
    loading,
    refreshing,
    onRefresh,
    exams,
    selectedExamId,
    setSelectedExamId,
    selectedExam,
    maxMarks,
    examSelectorItems,
    studentsInClass,
    gradedCount,
    classAverage,
    visibleGradeStudents,
    resultByStudent,
    scoreDrafts,
    savingId,
    updateScoreDraft,
    saveScore,
    openReport,
    exportCertificate,
    exportAllCertificates,
    exportingAllCertificates,
    gradePagination,
  } = props;

  const shellTitle = t("teacher.examReports.pageTitle");
  const shellSubtitle = t("teacher.examReports.pageSub");

  const shellProps = {
    title: shellTitle,
    subtitle: shellSubtitle,
    showBack: true as const,
    scroll: false as const,
  };

  const showGradeStudents = exams.length > 0;

  const scrollableBody =
    !loading && showGradeStudents ? (
      <ScrollView
        style={styles.studentScroll}
        contentContainerStyle={styles.studentScrollContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === "ios" ? "interactive" : "on-drag"
        }
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
          gradePagination={gradePagination}
        />
      </ScrollView>
    ) : null;

  const mainPanel = (
    <>
      <View style={styles.fixedTop}>
        <Text style={styles.label}>{t("common.class")}</Text>
        <SelectChips
          options={classOptions}
          selectedValue={selectedClassId}
          onSelect={setSelectedClassId}
        />

        <ExamReportsTopActions
          gradedCount={gradedCount}
          canExport={Boolean(selectedExam && gradedCount > 0)}
          exporting={exportingAllCertificates}
          onExportAllCertificates={() => void exportAllCertificates()}
        />

        {loading ? (
          <ActivityIndicator style={styles.loader} color="#2563EB" />
        ) : (
          <ExamReportsGradeFixedHeader
            exams={exams}
            examSelectorItems={examSelectorItems}
            selectedExamId={selectedExamId}
            onSelectExam={setSelectedExamId}
            selectedExam={selectedExam}
            maxMarks={maxMarks}
            gradedCount={gradedCount}
            classAverage={classAverage}
            studentsInClass={studentsInClass}
          />
        )}
      </View>
      {scrollableBody}
    </>
  );

  if (classesLoading || (loading && classes.length === 0)) {
    return (
      <TeacherScreenShell {...shellProps}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </TeacherScreenShell>
    );
  }

  if (classes.length === 0) {
    return (
      <TeacherScreenShell {...shellProps}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>
            {t("teacher.examReports.noClassesAssigned")}
          </Text>
          <Text style={styles.emptySub}>
            {t("teacher.examReports.noClassesSub")}
          </Text>
        </View>
      </TeacherScreenShell>
    );
  }

  return (
    <TeacherScreenShell
      {...shellProps}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <View style={styles.container}>
        {Platform.OS === "web" ? (
          <View style={styles.keyboardAvoid}>{mainPanel}</View>
        ) : (
          <KeyboardAvoidingView
            style={styles.keyboardAvoid}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            {mainPanel}
          </KeyboardAvoidingView>
        )}
        <ExamReportsKeyboardAccessory />
      </View>
    </TeacherScreenShell>
  );
}
