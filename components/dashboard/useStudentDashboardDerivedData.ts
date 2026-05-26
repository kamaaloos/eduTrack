import { useEffect, useMemo, useState } from "react";
import {
  buildHomeworkSlides,
  filterUpcomingExams,
} from "../../src/utils/academicFilters";
import {
  filterUpcomingScheduleSlots,
  findCurrentScheduleSlotId,
} from "../../src/utils/scheduleFormat";

type Options = {
  schedule: any[];
  homework: any[];
  exams: any[];
  gradedExamIds?: ReadonlySet<string>;
};

export function useStudentDashboardDerivedData({
  schedule,
  homework,
  exams,
  gradedExamIds,
}: Options) {
  const [scheduleNow, setScheduleNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setScheduleNow(new Date());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const visibleSchedule = useMemo(
    () => filterUpcomingScheduleSlots(schedule, scheduleNow),
    [schedule, scheduleNow],
  );

  const currentScheduleId = useMemo(
    () => findCurrentScheduleSlotId(schedule, scheduleNow),
    [schedule, scheduleNow],
  );

  const homeworkSlides = useMemo(
    () => buildHomeworkSlides(homework, scheduleNow),
    [homework, scheduleNow],
  );

  const visibleExams = useMemo(
    () => filterUpcomingExams(exams, scheduleNow, gradedExamIds ?? new Set()),
    [exams, scheduleNow, gradedExamIds],
  );

  return {
    scheduleNow,
    visibleSchedule,
    currentScheduleId,
    homeworkSlides,
    visibleExams,
  };
}
