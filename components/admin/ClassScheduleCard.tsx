import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { SelectChips, SelectList } from "../teachers/SelectChips";
import {
  addClassScheduleSlot,
  deleteClassScheduleSlot,
  loadClassScheduleForDay,
  type ClassScheduleEntry,
} from "../../src/services/classSchedule";
import {
  confirmAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";
import { ClassScheduleBulkImport } from "./ClassScheduleBulkImport";
import { ScheduleTimePicker } from "./ScheduleTimePicker";
import { db } from "../../src/services/firebase";
import {
  getTodayDayKey,
  getWeekdayLabel,
  scheduleDateTimeLine,
  scheduleSubjectTeacherLine,
  WEEKDAY_KEYS,
  type WeekdayKey,
} from "../../src/utils/scheduleFormat";

type ClassOption = { id: string; name: string };
type TeacherOption = { id: string; name: string };
type TeacherSubjectAssignment = { teacherId: string; subject: string };

type ClassScheduleCardProps = {
  classes: ClassOption[];
  teachers: TeacherOption[];
};

export function ClassScheduleCard({ classes, teachers }: ClassScheduleCardProps) {
  const { t } = useTranslation();
  const [classId, setClassId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<WeekdayKey>(getTodayDayKey());
  const [slots, setSlots] = useState<ClassScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [subject, setSubject] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);
  const [teacherSubjectAssignments, setTeacherSubjectAssignments] = useState<
    TeacherSubjectAssignment[]
  >([]);

  const todayKey = getTodayDayKey();
  const todayLabel = getWeekdayLabel(t, todayKey);
  const selectedDayLabel = getWeekdayLabel(t, dayOfWeek);

  const classOptions = useMemo(
    () =>
      classes.map((c) => ({
        value: c.id,
        label: c.name || t("common.classFallback"),
      })),
    [classes, t],
  );

  const dayOptions = useMemo(
    () =>
      WEEKDAY_KEYS.map((key) => ({
        value: key,
        label: getWeekdayLabel(t, key).slice(0, 3),
      })),
    [t],
  );

  const selectedTeacherSubjects = useMemo(() => {
    if (!selectedTeacherId) return [];
    const subjectSet = new Set<string>();
    for (const row of teacherSubjectAssignments) {
      if (row.teacherId === selectedTeacherId && row.subject.trim()) {
        subjectSet.add(row.subject.trim());
      }
    }
    return [...subjectSet].sort((a, b) => a.localeCompare(b));
  }, [selectedTeacherId, teacherSubjectAssignments]);

  const subjectOptions = useMemo(
    () =>
      selectedTeacherSubjects.map((item) => ({
        value: item,
        label: item,
      })),
    [selectedTeacherSubjects],
  );

  const loadSlots = useCallback(async () => {
    if (!classId) {
      setSlots([]);
      return;
    }
    setLoading(true);
    try {
      const list = await loadClassScheduleForDay(classId, dayOfWeek);
      setSlots(list);
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.scheduleLoadFailed"),
      );
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [classId, dayOfWeek, t]);

  useEffect(() => {
    if (classes.length > 0 && !classId) {
      setClassId(classes[0].id);
    }
  }, [classes, classId]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const loadClassTeacherAssignments = useCallback(async () => {
    if (!classId) {
      setTeacherOptions([]);
      setTeacherSubjectAssignments([]);
      return;
    }

    setAssignmentsLoading(true);
    try {
      const [classTeachersSnap, teacherSubjectsSnap] = await Promise.all([
        getDocs(query(collection(db, "teacherClasses"), where("classId", "==", classId))),
        getDocs(query(collection(db, "teacherSubjects"), where("classId", "==", classId))),
      ]);

      const linkedTeacherIds = new Set<string>();
      classTeachersSnap.docs.forEach((docSnap) => {
        const teacherId = docSnap.data().teacherId as string | undefined;
        if (teacherId) linkedTeacherIds.add(teacherId);
      });

      const subjects: TeacherSubjectAssignment[] = teacherSubjectsSnap.docs
        .map((docSnap) => {
          const data = docSnap.data();
          const teacherId = data.teacherId as string | undefined;
          const rowSubject = data.subject as string | undefined;
          if (!teacherId || !rowSubject) return null;
          linkedTeacherIds.add(teacherId);
          return { teacherId, subject: rowSubject };
        })
        .filter((row): row is TeacherSubjectAssignment => row !== null);

      const teacherById = new Map(teachers.map((teacher) => [teacher.id, teacher.name]));
      const options = [...linkedTeacherIds]
        .map((id) => ({
          id,
          name: teacherById.get(id) || t("common.teacher"),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setTeacherOptions(options);
      setTeacherSubjectAssignments(subjects);
      setSelectedTeacherId((prev) =>
        prev && options.some((item) => item.id === prev) ? prev : "",
      );
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.scheduleLoadFailed"),
      );
      setTeacherOptions([]);
      setTeacherSubjectAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  }, [classId, t, teachers]);

  useEffect(() => {
    void loadClassTeacherAssignments();
  }, [loadClassTeacherAssignments]);

  useEffect(() => {
    setSubject("");
  }, [selectedTeacherId]);

  const handleAdd = async () => {
    if (!classId) {
      showErrorAlert(t("common.error"), t("admin.selectClassFirst"));
      return;
    }
    if (!startTime.trim() || !endTime.trim() || !subject.trim()) {
      showErrorAlert(t("common.error"), t("admin.fillTimeAndSubject"));
      return;
    }

    setSaving(true);
    try {
      await addClassScheduleSlot({
        classId,
        dayOfWeek,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        subject: subject.trim(),
        teacherName:
          teachers.find((item) => item.id === selectedTeacherId)?.name?.trim() || "",
        sortOrder: slots.length,
      });
      setStartTime("08:00");
      setEndTime("09:00");
      setSubject("");
      await loadSlots();
      const visibilityNote =
        dayOfWeek === todayKey
          ? t("admin.scheduleVisibleToday")
          : t("admin.scheduleVisibleOtherDay", {
              day: selectedDayLabel,
              today: todayLabel,
            });
      showSuccessAlert(
        t("admin.scheduleSavedTitle"),
        `${t("admin.scheduleSavedDay", { day: selectedDayLabel })}\n${visibilityNote}`,
      );
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.couldNotSaveSlot"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (entry: ClassScheduleEntry) => {
    void (async () => {
      const confirmed = await confirmAction(
        t("admin.deleteSlotTitle"),
        formatScheduleLine(entry),
        t("common.delete"),
        t("common.cancel"),
      );
      if (!confirmed) return;

      try {
        await deleteClassScheduleSlot(classId, entry.id);
        await loadSlots();
      } catch (err) {
        showErrorAlert(
          t("common.error"),
          err instanceof Error ? err.message : t("admin.deleteFailed"),
        );
      }
    })();
  };

  function formatScheduleLine(entry: ClassScheduleEntry) {
    return `${scheduleDateTimeLine(entry, dayOfWeek)}\n${scheduleSubjectTeacherLine(entry)}`;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>📅 {t("admin.classScheduleTitle")}</Text>
      <Text style={styles.hint}>{t("admin.classScheduleHint")}</Text>
      <Text style={styles.todayBanner}>
        {t("admin.todayIsBanner", { day: todayLabel })}
      </Text>

      {classOptions.length === 0 ? (
        <Text style={styles.empty}>{t("admin.createClassFirst")}</Text>
      ) : (
        <>
          <Text style={styles.label}>{t("common.class")}</Text>
          <SelectChips
            options={classOptions}
            selectedValue={classId}
            onSelect={setClassId}
          />

          <Text style={styles.label}>{t("admin.dayLabel")}</Text>
          <SelectChips
            options={dayOptions}
            selectedValue={dayOfWeek}
            onSelect={(v) => setDayOfWeek(v as WeekdayKey)}
          />
          <TouchableOpacity
            style={styles.todayBtn}
            onPress={() => setDayOfWeek(todayKey)}
          >
            <Text style={styles.todayBtnText}>
              {t("admin.useToday", {
                short: getWeekdayLabel(t, todayKey).slice(0, 3),
              })}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>{t("admin.addPeriod")}</Text>
          <View style={styles.row}>
            <ScheduleTimePicker
              label={t("admin.startLabel")}
              value={startTime}
              onChange={setStartTime}
            />
            <Text style={styles.dash}>–</Text>
            <ScheduleTimePicker
              label={t("admin.endLabel")}
              value={endTime}
              onChange={setEndTime}
            />
          </View>
          <Text style={styles.label}>{t("common.teacher")}</Text>
          {assignmentsLoading ? (
            <ActivityIndicator style={styles.inlineLoader} color="#2563EB" />
          ) : teacherOptions.length === 0 ? (
            <Text style={styles.empty}>
              {t("admin.scheduleNoTeachersForClass")}
            </Text>
          ) : Platform.OS === "web" ? (
            <SelectChips
              options={teacherOptions.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              selectedValue={selectedTeacherId}
              onSelect={setSelectedTeacherId}
            />
          ) : (
            <SelectList
              options={teacherOptions.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              selectedValue={selectedTeacherId}
              onSelect={setSelectedTeacherId}
            />
          )}

          <Text style={styles.label}>{t("common.subject")}</Text>
          {!selectedTeacherId ? (
            <Text style={styles.empty}>{t("admin.schedulePickTeacherFirst")}</Text>
          ) : subjectOptions.length === 0 ? (
            <Text style={styles.empty}>{t("admin.scheduleNoSubjectsForTeacher")}</Text>
          ) : Platform.OS === "web" ? (
            <SelectChips
              options={subjectOptions}
              selectedValue={subject}
              onSelect={setSubject}
            />
          ) : (
            <SelectList
              options={subjectOptions}
              selectedValue={subject}
              onSelect={setSubject}
            />
          )}

          <TouchableOpacity
            style={[styles.addBtn, saving && styles.addBtnDisabled]}
            onPress={handleAdd}
            disabled={
              saving ||
              assignmentsLoading ||
              !selectedTeacherId ||
              subjectOptions.length === 0
            }
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.addBtnText}>{t("admin.addToSchedule")}</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.listTitle}>
            {t("admin.periodsForDay", {
              day: selectedDayLabel,
              count: slots.length,
            })}
          </Text>
          {loading ? (
            <ActivityIndicator style={styles.loader} color="#2563EB" />
          ) : slots.length === 0 ? (
            <Text style={styles.empty}>{t("admin.noPeriodsForDay")}</Text>
          ) : (
            slots.map((slot) => (
              <View key={slot.id} style={styles.slotRow}>
                <View style={styles.slotTextCol}>
                  <Text style={styles.slotDateTime}>
                    {scheduleDateTimeLine(slot, dayOfWeek)}
                  </Text>
                  <Text style={styles.slotSubject}>
                    {scheduleSubjectTeacherLine(slot)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(slot)}
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.deleteText}>{t("common.delete")}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <ClassScheduleBulkImport onImported={loadSlots} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  hint: { fontSize: 13, color: "#64748B", lineHeight: 18, marginBottom: 8 },
  todayBanner: {
    fontSize: 13,
    color: "#1E40AF",
    fontWeight: "600",
    backgroundColor: "#EFF6FF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    lineHeight: 18,
  },
  todayBtn: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  todayBtnText: { color: "#2563EB", fontWeight: "700", fontSize: 13 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginTop: 12,
    marginBottom: 8,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  dash: { fontSize: 18, color: "#64748B", fontWeight: "600" },
  inlineLoader: { marginVertical: 10 },
  addBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  addBtnDisabled: { opacity: 0.7 },
  addBtnText: { color: "#FFFFFF", fontWeight: "700" },
  listTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  slotTextCol: { flex: 1, gap: 4 },
  slotDateTime: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  slotSubject: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  deleteText: { color: "#DC2626", fontWeight: "600", fontSize: 13 },
  empty: { color: "#94A3B8", fontSize: 14, paddingVertical: 8 },
  loader: { marginVertical: 12 },
});
