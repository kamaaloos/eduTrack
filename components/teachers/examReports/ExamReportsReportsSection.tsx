import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { usePaginatedList } from "../../../hooks/usePaginatedList";
import type { TeacherStudent } from "../../../src/services/teacherStudents";
import { parsePhotoURL } from "../../../src/utils/userAvatar";
import { ListPageNav } from "../../common/ListPageNav";
import { UserAvatar } from "../../common/UserAvatar";
import { examReportsStyles as styles } from "./examReportsStyles";
import { EXAM_REPORTS_KEYBOARD_ACCESSORY_ID } from "./examReportsTypes";

type StudentPagination = ReturnType<typeof usePaginatedList<TeacherStudent>>;

type ExamReportsReportsSectionProps = {
  reportSearch: string;
  onReportSearchChange: (text: string) => void;
  filteredReportStudents: TeacherStudent[];
  visibleReportStudents: TeacherStudent[];
  onOpenReport: (student: TeacherStudent) => void;
  reportPagination: StudentPagination;
};

export function ExamReportsReportsSearch({
  reportSearch,
  onReportSearchChange,
}: Pick<ExamReportsReportsSectionProps, "reportSearch" | "onReportSearchChange">) {
  const { t } = useTranslation();

  return (
    <TextInput
      style={styles.search}
      placeholder={t("teacher.examReports.searchStudents")}
      returnKeyType="search"
      blurOnSubmit
      onSubmitEditing={() => Keyboard.dismiss()}
      inputAccessoryViewID={
        Platform.OS === "ios" ? EXAM_REPORTS_KEYBOARD_ACCESSORY_ID : undefined
      }
      value={reportSearch}
      onChangeText={onReportSearchChange}
    />
  );
}

export function ExamReportsReportsStudentList({
  filteredReportStudents,
  visibleReportStudents,
  onOpenReport,
  reportPagination,
}: Pick<
  ExamReportsReportsSectionProps,
  | "filteredReportStudents"
  | "visibleReportStudents"
  | "onOpenReport"
  | "reportPagination"
>) {
  const { t } = useTranslation();

  if (filteredReportStudents.length === 0) {
    return (
      <Text style={styles.emptySub}>
        {t("teacher.examReports.noSearchMatch")}
      </Text>
    );
  }

  return (
    <>
      <Text style={styles.listHint}>
        {t("teacher.examReports.showingStudents", {
          shown: reportPagination.rangeEnd,
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
          <UserAvatar
            name={student.name}
            email={student.email}
            photoURL={parsePhotoURL(student.photoURL)}
            size={44}
            textColor="#1D4ED8"
            backgroundColor="#DBEAFE"
          />
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
      <View style={styles.listPagination}>
        <ListPageNav
          page={reportPagination.page}
          totalPages={reportPagination.totalPages}
          canPrev={reportPagination.canPrev}
          canNext={reportPagination.canNext}
          onPrev={reportPagination.prevPage}
          onNext={reportPagination.nextPage}
        />
      </View>
    </>
  );
}

export function ExamReportsReportsSection({
  reportSearch,
  onReportSearchChange,
  filteredReportStudents,
  visibleReportStudents,
  onOpenReport,
  reportPagination,
}: ExamReportsReportsSectionProps) {
  return (
    <>
      <ExamReportsReportsSearch
        reportSearch={reportSearch}
        onReportSearchChange={onReportSearchChange}
      />
      <ExamReportsReportsStudentList
        filteredReportStudents={filteredReportStudents}
        visibleReportStudents={visibleReportStudents}
        onOpenReport={onOpenReport}
        reportPagination={reportPagination}
      />
    </>
  );
}
