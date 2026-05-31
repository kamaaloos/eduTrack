export type StudentDashboardViewProps = {
  studentId: string;
  classId: string | null;
  displayName: string;
  photoURL?: string | null;
  routePrefix?: string;
  showNotifications?: boolean;
  showHeaderLogout?: boolean;
  onMenuPress?: () => void;
  showAbsenceReport?: boolean;
  showHealthCheck?: boolean;
  onHealthCheckPress?: () => void;
  parentId?: string;
  headerSubtitle?: string;
  /** Parent view: hide "View all" and use /(parent)/detail routes. */
  hideViewAllRoutes?: boolean;
  useParentRoutes?: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  messages: any[];
  homework: any[];
  exams: any[];
  schedule: any[];
  remarksAndAttendance: any[];
  gradedExamIds?: ReadonlySet<string>;
};

export type StudentDashboardNavigation = {
  routePrefix: string;
  listRoute: (path: string) => string | undefined;
  openStudentDetail: (pathname: string, params: Record<string, string>) => void;
  openParentDetail: (params: Record<string, string>) => void;
};
