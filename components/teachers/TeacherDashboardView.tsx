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
  displayName?: string;
  photoURL?: string | null;
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
  onMenuPress?: () => void;
};

export function TeacherDashboardView({
  displayName,
  photoURL,
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
  onMenuPress,
}: TeacherDashboardViewProps) {
  return (
    <View style={styles.mainContainer}>
      <TeacherDashboardHeader
        displayName={displayName}
        photoURL={photoURL}
        firstName={firstName}
        alertCount={alertCount}
        onMenuPress={onMenuPress}
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
