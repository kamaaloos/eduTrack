import { RefreshControl, ScrollView, View } from "react-native";
import { TeacherDashboardAnnouncementsSection } from "./TeacherDashboardAnnouncementsSection";
import { TeacherDashboardBanners } from "./TeacherDashboardBanners";
import { TeacherDashboardClassesSection } from "./TeacherDashboardClassesSection";
import { TeacherDashboardHeader } from "./TeacherDashboardHeader";
import { TeacherDashboardQuickActions } from "./TeacherDashboardQuickActions";
import { TeacherDashboardStats } from "./TeacherDashboardStats";
import { TeacherDashboardStudentsSection } from "./TeacherDashboardStudentsSection";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

export type TeacherDashboardViewProps = {
  initials: string;
  firstName: string;
  alertCount: number;
  pendingAbsenceCount: number;
  classCount: number;
  studentCount: number;
  classChipOptions: { value: string; label: string }[];
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
  selectedClassLabel: string;
  filteredStudents: any[];
  announcements: any[];
  refreshing: boolean;
  onRefresh: () => void;
  onLogout: () => Promise<void>;
};

export function TeacherDashboardView({
  initials,
  firstName,
  alertCount,
  pendingAbsenceCount,
  classCount,
  studentCount,
  classChipOptions,
  selectedClassId,
  onSelectClass,
  selectedClassLabel,
  filteredStudents,
  announcements,
  refreshing,
  onRefresh,
  onLogout,
}: TeacherDashboardViewProps) {
  return (
    <View style={styles.mainContainer}>
      <TeacherDashboardHeader
        initials={initials}
        firstName={firstName}
        alertCount={alertCount}
        onLogout={onLogout}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <TeacherDashboardQuickActions
          pendingAbsenceCount={pendingAbsenceCount}
        />

        <TeacherDashboardBanners />

        <TeacherDashboardStats
          classCount={classCount}
          studentCount={studentCount}
        />

        <TeacherDashboardClassesSection
          classChipOptions={classChipOptions}
          selectedClassId={selectedClassId}
          onSelectClass={onSelectClass}
        />

        <TeacherDashboardStudentsSection
          selectedClassId={selectedClassId}
          selectedClassLabel={selectedClassLabel}
          filteredStudents={filteredStudents}
        />

        <TeacherDashboardAnnouncementsSection announcements={announcements} />

        <View style={styles.scrollBottomSpacer} />
      </ScrollView>
    </View>
  );
}
