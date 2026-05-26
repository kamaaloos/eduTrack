import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SelectChips } from "../teachers/SelectChips";
import {
  addClassScheduleSlot,
  deleteClassScheduleSlot,
  loadClassScheduleForDay,
  type ClassScheduleEntry,
} from "../../src/services/classSchedule";
import { ScheduleTimePicker } from "./ScheduleTimePicker";
import {
  getTodayDayKey,
  getWeekdayLabel,
  scheduleDateTimeLine,
  scheduleSubjectTeacherLine,
  WEEKDAY_KEYS,
  type WeekdayKey,
} from "../../src/utils/scheduleFormat";

type ClassOption = { id: string; name: string };

type ClassScheduleCardProps = {
  classes: ClassOption[];
};

export function ClassScheduleCard({ classes }: ClassScheduleCardProps) {
  const { t } = useTranslation();
  const [classId, setClassId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<WeekdayKey>(getTodayDayKey());
  const [slots, setSlots] = useState<ClassScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [subject, setSubject] = useState("");
  const [teacherName, setTeacherName] = useState("");

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
      Alert.alert(
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

  const handleAdd = async () => {
    if (!classId) {
      Alert.alert(t("common.error"), t("admin.selectClassFirst"));
      return;
    }
    if (!startTime.trim() || !endTime.trim() || !subject.trim()) {
      Alert.alert(t("common.error"), t("admin.fillTimeAndSubject"));
      return;
    }

    setSaving(true);
    try {
      const docId = await addClassScheduleSlot({
        classId,
        dayOfWeek,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        subject: subject.trim(),
        teacherName: teacherName.trim(),
        sortOrder: slots.length,
      });
      setStartTime("");
      setEndTime("");
      setSubject("");
      setTeacherName("");
      await loadSlots();
      const visibilityNote =
        dayOfWeek === todayKey
          ? t("admin.scheduleVisibleToday")
          : t("admin.scheduleVisibleOtherDay", {
              day: selectedDayLabel,
              today: todayLabel,
            });
      Alert.alert(
        t("admin.scheduleSavedTitle"),
        `${t("admin.scheduleSavedPath", { classId, docId })}\n\n${t("admin.scheduleSavedDay", { day: selectedDayLabel })}\n${visibilityNote}`,
      );
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.couldNotSaveSlot"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (entry: ClassScheduleEntry) => {
    Alert.alert(t("admin.deleteSlotTitle"), formatScheduleLine(entry), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteClassScheduleSlot(classId, entry.id);
            await loadSlots();
          } catch (err) {
            Alert.alert(
              t("common.error"),
              err instanceof Error ? err.message : t("admin.deleteFailed"),
            );
          }
        },
      },
    ]);
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
          <TextInput
            style={styles.input}
            placeholder={t("admin.scheduleSubjectPlaceholder")}
            value={subject}
            onChangeText={setSubject}
          />
          <TextInput
            style={styles.input}
            placeholder={t("admin.teacherNamePlaceholder")}
            value={teacherName}
            onChangeText={setTeacherName}
          />

          <TouchableOpacity
            style={[styles.addBtn, saving && styles.addBtnDisabled]}
            onPress={handleAdd}
            disabled={saving}
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
                <TouchableOpacity onPress={() => handleDelete(slot)}>
                  <Text style={styles.deleteText}>{t("common.delete")}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
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
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
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
