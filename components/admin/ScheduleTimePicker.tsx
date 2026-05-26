import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

function parseTime(value: string): Date {
  const d = new Date();
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (match) {
    d.setHours(Number(match[1]), Number(match[2]), 0, 0);
    return d;
  }
  d.setHours(8, 0, 0, 0);
  return d;
}

export function formatTimeHHmm(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

type ScheduleTimePickerProps = {
  label: string;
  value: string;
  onChange: (time: string) => void;
};

export function ScheduleTimePicker({
  label,
  value,
  onChange,
}: ScheduleTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(() => parseTime(value));

  const display = value.trim() || "Tap to set";

  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
    }
    if (event.type === "dismissed" || !date) return;
    setInternal(date);
    onChange(formatTimeHHmm(date));
  };

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
