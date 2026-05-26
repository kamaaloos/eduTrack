import type { TFunction } from "i18next";

export function attendanceStatusLabel(label: string, t: TFunction) {
  const keyMap: Record<string, string> = {
    EXCUSED: "common.excused",
    ABSENT: "common.absent",
    PRESENT: "common.present",
    LATE: "common.late",
  };
  const key = keyMap[label.toUpperCase()];
  return key ? t(key) : label;
}
