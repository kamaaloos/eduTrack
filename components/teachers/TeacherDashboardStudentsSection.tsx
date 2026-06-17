import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { parsePhotoURL } from "../../src/utils/userAvatar";
import { ListPageNav } from "../common/ListPageNav";
import { UserAvatar } from "../common/UserAvatar";
import { DashboardSlideRow } from "../dashboard/DashboardSlideRow";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

const STUDENT_LIST_PAGE_SIZE = 4;

type TeacherDashboardStudentsSectionProps = {
  selectedClassId: string;
  selectedClassLabel: string;
  filteredStudents: any[];
};

export function TeacherDashboardStudentsSection({
  selectedClassId,
  selectedClassLabel,
  filteredStudents,
}: TeacherDashboardStudentsSectionProps) {
  const { t } = useTranslation();
  const [studentSearch, setStudentSearch] = useState("");

  const searchedStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return filteredStudents;
    return filteredStudents.filter((item) => {
      const name = String(item.name ?? "").toLowerCase();
      const email = String(item.email ?? "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [filteredStudents, studentSearch]);

  const pagination = usePaginatedList(
    searchedStudents,
    STUDENT_LIST_PAGE_SIZE,
    `${selectedClassId}:${studentSearch}`,
  );

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {t("teacher.dashboard.studentsSection")}
          {selectedClassLabel ? ` · ${selectedClassLabel}` : ""}
        </Text>
        {selectedClassId ? (
          <Text style={styles.sectionHint}>
            {filteredStudents.length} {t("teacher.dashboard.students")}
          </Text>
        ) : null}
      </View>

      {!selectedClassId ? (
        <Text style={styles.emptyHint}>
          {t("teacher.dashboard.selectClassHint")}
        </Text>
      ) : filteredStudents.length === 0 ? (
        <Text style={styles.emptyHint}>
          {t("teacher.dashboard.noStudentsInClass")}
        </Text>
      ) : (
        <>
          <TextInput
            style={styles.studentSearchInput}
            placeholder={t("teacher.academic.searchStudents")}
            value={studentSearch}
            onChangeText={setStudentSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchedStudents.length === 0 ? (
            <Text style={styles.emptyHint}>{t("admin.selectorNoMatches")}</Text>
          ) : (
            <>
              <DashboardSlideRow>
                {pagination.pageItems.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.studentCard}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({
                        pathname: "/(teachers)/student-report/[studentId]",
                        params: {
                          studentId: item.id,
                          name: item.name || t("common.student"),
                          classId: item.classId || selectedClassId,
                        },
                      })
                    }
                  >
                    <UserAvatar
                      name={item.name}
                      email={item.email}
                      photoURL={parsePhotoURL(item.photoURL)}
                      size={54}
                      textColor="#1D4ED8"
                      backgroundColor="#DBEAFE"
                      style={{ marginBottom: 12 }}
                    />

                    <Text style={styles.studentName} numberOfLines={2}>
                      {item.name || t("common.student")}
                    </Text>

                    <Text style={styles.studentReportHint}>
                      {t("teacher.dashboard.viewReport")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </DashboardSlideRow>
              <View style={styles.studentListPagination}>
                <ListPageNav
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  canPrev={pagination.canPrev}
                  canNext={pagination.canNext}
                  onPrev={pagination.prevPage}
                  onNext={pagination.nextPage}
                />
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
}
