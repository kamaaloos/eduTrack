import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

function isDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

function parseDateKey(value: string): Date {
  const trimmed = value.trim();
  if (isDateKey(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0, 0);
  }
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return today;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type FormDateInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  placeholder?: string;
  editable?: boolean;
};

function WebDateInput({
  value,
  onChangeText,
  style,
  editable = true,
}: FormDateInputProps) {
  return (
    <View style={style}>
      {React.createElement("input", {
        type: "date",
        value: isDateKey(value) ? value.trim() : "",
        disabled: editable === false,
        onChange: (e: { target: { value: string } }) => {
          const next = e.target.value;
          if (next) onChangeText(next);
        },
        style: {
          width: "100%",
          fontSize: 16,
          border: "none",
          outline: "none",
          backgroundColor: "transparent",
          fontFamily: "inherit",
          color: "#0F172A",
          boxSizing: "border-box",
          padding: 0,
          margin: 0,
        },
      })}
    </View>
  );
}

export function FormDateInput({
  value,
  onChangeText,
  style,
  placeholder = "Tap to set date",
  editable = true,
}: FormDateInputProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(() => parseDateKey(value));

  useEffect(() => {
    setInternal(parseDateKey(value));
  }, [value]);

  const display = isDateKey(value) ? value.trim() : placeholder;

  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
    }
    if (event.type === "dismissed" || !date) return;
    setInternal(date);
    onChangeText(formatDateKey(date));
  };

  if (Platform.OS === "web") {
    return (
      <WebDateInput
        value={value}
        onChangeText={onChangeText}
        style={style}
        editable={editable}
      />
    );
  }

  return (
    <View>
      <Pressable
        style={[style, !editable && styles.disabled]}
        onPress={() => editable && setOpen(true)}
        accessibilityRole="button"
        disabled={!editable}
      >
        <Text style={[styles.fieldText, !isDateKey(value) && styles.placeholder]}>
          {display}
        </Text>
      </Pressable>

      {open ? (
        <View style={styles.pickerBox}>
          <DateTimePicker
            value={internal}
            mode="date"
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
  fieldText: {
    fontSize: 16,
    color: "#0F172A",
  },
  placeholder: {
    color: "#94A3B8",
  },
  disabled: {
    opacity: 0.6,
  },
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
  doneText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 15,
  },
});
