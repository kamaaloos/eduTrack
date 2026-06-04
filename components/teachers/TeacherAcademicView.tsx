import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import type { useTeacherAcademic } from "../../hooks/useTeacherAcademic";
import { DirectMessageCard } from "../messaging/DirectMessageCard";
import { AuthContext } from "../../src/context/authContext";
import { TeacherScreenShell } from "./TeacherScreenShell";
import { TeacherAcademicClassCard } from "./academic/TeacherAcademicClassCard";
import { TeacherAcademicTabs } from "./academic/TeacherAcademicTabs";
import { TeacherAnnouncementForm } from "./academic/TeacherAnnouncementForm";
import { TeacherExamForm } from "./academic/TeacherExamForm";
import { TeacherHomeworkForm } from "./academic/TeacherHomeworkForm";
import { TeacherRemarkForm } from "./academic/TeacherRemarkForm";
import { teacherAcademicStyles as styles } from "./academic/teacherAcademicStyles";

export type TeacherAcademicViewProps = ReturnType<typeof useTeacherAcademic>;

export function TeacherAcademicView(props: TeacherAcademicViewProps) {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);
  const {
    activeTab,
    setActiveTab,
    assignedClasses,
    selectedClassId,
    setSelectedClassId,
    loadingClasses,
    classesError,
    classOptions,
    allowedSubjects,
    students,
    loadingStudents,
    selectedStudentId,
    setSelectedStudentId,
    setSelectedStudentName,
    studentSelectorItems,
    remarkTypeOptions,
    hwSubject,
    setHwSubject,
    hwTitle,
    setHwTitle,
    hwDaysLeft,
    setHwDaysLeft,
    hwDetails,
    setHwDetails,
    examSubject,
    setExamSubject,
    examTitle,
    setExamTitle,
    examMarks,
    setExamMarks,
    examDetails,
    setExamDetails,
    remarkType,
    setRemarkType,
    remarkText,
    setRemarkText,
    rating,
    setRating,
    announcementTitle,
    setAnnouncementTitle,
    announcementText,
    setAnnouncementText,
    publishHomework,
    publishExam,
    publishRemark,
    publishAnnouncement,
  } = props;

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    const match = students.find((s) => s.id === id);
    setSelectedStudentName(match?.name || match?.email || "");
  };

  const directMessageStudentOptions = useMemo(
    () =>
      studentSelectorItems.map((s) => ({
        value: s.id,
        label: s.name,
      })),
    [studentSelectorItems],
  );

  return (
    <TeacherScreenShell
      title={t("teacher.academic.headerTitle")}
      subtitle={t("teacher.academic.headerSubtitle")}
      scroll={false}
    >
      <View style={styles.container}>
      <TeacherAcademicTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <TeacherAcademicClassCard
          loadingClasses={loadingClasses}
          classesError={classesError}
          assignedClasses={assignedClasses}
          classOptions={classOptions}
          selectedClassId={selectedClassId}
          onSelectClass={setSelectedClassId}
        />

        {activeTab === "homework" ? (
          <TeacherHomeworkForm
            allowedSubjects={allowedSubjects}
            hwSubject={hwSubject}
            onHwSubjectChange={setHwSubject}
            hwTitle={hwTitle}
            onHwTitleChange={setHwTitle}
            hwDaysLeft={hwDaysLeft}
            onHwDaysLeftChange={setHwDaysLeft}
            hwDetails={hwDetails}
            onHwDetailsChange={setHwDetails}
            onPublish={publishHomework}
          />
        ) : null}

        {activeTab === "exams" ? (
          <TeacherExamForm
            allowedSubjects={allowedSubjects}
            examSubject={examSubject}
            onExamSubjectChange={setExamSubject}
            examTitle={examTitle}
            onExamTitleChange={setExamTitle}
            examMarks={examMarks}
            onExamMarksChange={setExamMarks}
            examDetails={examDetails}
            onExamDetailsChange={setExamDetails}
            onPublish={publishExam}
          />
        ) : null}

        {activeTab === "remarks" ? (
          <TeacherRemarkForm
            selectedClassId={selectedClassId}
            loadingStudents={loadingStudents}
            students={students}
            studentSelectorItems={studentSelectorItems}
            selectedStudentId={selectedStudentId}
            onSelectStudent={handleSelectStudent}
            remarkText={remarkText}
            onRemarkTextChange={setRemarkText}
            remarkTypeOptions={remarkTypeOptions}
            remarkType={remarkType}
            onRemarkTypeChange={setRemarkType}
            rating={rating}
            onRatingChange={setRating}
            onPublish={publishRemark}
          />
        ) : null}

        {activeTab === "announcements" ? (
          <>
            <TeacherAnnouncementForm
              announcementTitle={announcementTitle}
              onAnnouncementTitleChange={setAnnouncementTitle}
              announcementText={announcementText}
              onAnnouncementTextChange={setAnnouncementText}
              onPublish={publishAnnouncement}
            />
            <DirectMessageCard
              classOptions={classOptions}
              selectedClassId={selectedClassId}
              onClassChange={setSelectedClassId}
              students={directMessageStudentOptions}
              loadingStudents={loadingStudents}
              senderRole="teacher"
              senderId={user?.uid}
              senderName={userData?.name ?? t("common.teacher")}
              hideClassPicker
            />
          </>
        ) : null}

        <View style={styles.scrollBottomSpacer} />
      </ScrollView>
    </View>
    </TeacherScreenShell>
  );
}
