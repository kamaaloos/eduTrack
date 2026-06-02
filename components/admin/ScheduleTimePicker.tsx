import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  formatTimeHHmm,
  normalizeTimeHHmm,
  parseHHmmToMinutes,
} from "../../src/utils/scheduleFormat";

function parseTime(value: string): Date {
  const d = new Date();
  const minutes = parseHHmmToMinutes(value);
  if (minutes != null) {
    d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return d;
  }
  d.setHours(8, 0, 0, 0);
  return d;
}

type ScheduleTimePickerProps = {
  label: string;
  value: string;
  onChange: (time: string) => void;
};

function WebTimeInput({ label, value, onChange }: ScheduleTimePickerProps) {
  const htmlValue = normalizeTimeHHmm(value || "08:00");

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {React.createElement("input", {
        type: "time",
        value: htmlValue,
        onChange: (e: { target: { value: string } }) => {
          const next = e.target.value;
          if (next) onChange(next);
        },
        style: {
          width: "100%",
          fontSize: 16,
          fontWeight: 700,
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          backgroundColor: "#F1F5F9",
          color: "#0F172A",
          boxSizing: "border-box",
          fontFamily: "inherit",
        },
      })}
    </View>
  );
}

export function ScheduleTimePicker({
  label,
  value,
  onChange,
}: ScheduleTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(() => parseTime(value));

  useEffect(() => {
    setInternal(parseTime(value));
  }, [value]);

  const display = value.trim() ? normalizeTimeHHmm(value) : "Tap to set";

  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
    }
    if (event.type === "dismissed" || !date) return;
    setInternal(date);
    onChange(formatTimeHHmm(date));
  };

  if (Platform.OS === "web") {
    return <WebTimeInput label={label} value={value} onChange={onChange} />;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={styles.field}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
      >
        <Text style={styles.fieldText}>{display}</Text>
        <Text style={styles.chevron}>🕐</Text>
      </Pressable>

      {open ? (
        <View style={styles.pickerBox}>
          <DateTimePicker
            value={internal}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onPickerChange}
          />
          {Platform.OS === "ios" ? (
            <Pressable style={styles.doneBtn} onPress={() => setOpen(false)}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export { formatTimeHHmm } from "../../src/utils/scheduleFormat";

const styles = StyleSheet.create({
  wrap: { flex: 1, minWidth: 0 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  fieldText: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  chevron: { fontSize: 18 },
  pickerBox: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  doneBtn: {
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  doneText: { color: "#2563EB", fontWeight: "700", fontSize: 15 },
});
