import * as XLSX from "xlsx";
import { Platform } from "react-native";
import { downloadBase64AsFile } from "../utils/webFileDownload";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { APP_DISPLAY_NAME } from "../constants/brand";

export const SCHEDULE_TEMPLATE_FILENAME = `${APP_DISPLAY_NAME.toLowerCase().replace(/\s+/g, "-")}-schedule-term-template.xlsx`;

const SCHEDULE_HEADERS = [
  "className",
  "dayOfWeek",
  "startTime",
  "endTime",
  "subject",
  "teacherName",
  "sortOrder",
];

const SCHEDULE_EXAMPLES: string[][] = [
  ["Grade 4A", "monday", "08:00", "08:45", "Mathematics", "Ahmed", "0"],
  ["Grade 4A", "monday", "09:00", "09:45", "English", "Sarah", "1"],
  ["Grade 4A", "monday", "10:15", "11:00", "History", "Omar", "2"],
  ["Grade 4A", "tuesday", "08:00", "08:45", "Mathematics", "Ahmed", "0"],
  ["Grade 4A", "tuesday", "09:00", "09:45", "Science", "Layla", "1"],
  ["Grade 4A", "wednesday", "08:00", "08:45", "English", "Sarah", "0"],
  ["Grade 4A", "thursday", "08:00", "08:45", "Mathematics", "Ahmed", "0"],
  ["Grade 4A", "friday", "08:00", "08:45", "Geography", "Hassan", "0"],
];

const GUIDE_ROWS: string[][] = [
  ["Term schedule import — day-by-day guide"],
  [""],
  ["Overview"],
  ["• One row = one class period (subject block)."],
  ["• Repeat rows for each day of the week to build the full term timetable."],
  ["• Import the schedule sheet after classes exist (create classes first)."],
  [""],
  ["Columns (schedule sheet)"],
  ["className", "Must match an existing class name exactly (e.g. Grade 4A)."],
  ["dayOfWeek", "sunday | monday | tuesday | wednesday | thursday | friday | saturday"],
  ["", "Short forms also work: sun, mon, tue, wed, thu, fri, sat"],
  ["startTime / endTime", "24-hour HH:mm (08:00, 13:30). End must be after start."],
  ["subject", "Subject name shown on student dashboard."],
  ["teacherName", "Optional; shown as initials (Mohammed → Moh)."],
  ["sortOrder", "Optional number; lower = earlier in the day (default 0)."],
  [""],
  ["Suggested workflow for a full term week"],
  ["1. List all classes in the classes sheet or create them in the app."],
  ["2. For each class, add Monday rows for every period, then Tuesday, etc."],
  ["3. Copy the example rows in the schedule sheet and edit times/subjects."],
  ["4. Upload the file on Admin → Classes → Bulk import schedule."],
  [""],
  ["Tips"],
  ["• Students only see today's periods on the dashboard — pick the correct dayOfWeek."],
  ["• You can import the same file again; duplicate rows create additional periods."],
  ["• Use sortOrder 0,1,2… when two periods share the same start time display order."],
];

export function buildScheduleImportTemplateWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const guideWs = XLSX.utils.aoa_to_sheet(GUIDE_ROWS);
  guideWs["!cols"] = [{ wch: 22 }, { wch: 72 }];
  XLSX.utils.book_append_sheet(wb, guideWs, "schedule_guide");

  const scheduleWs = XLSX.utils.aoa_to_sheet([
    SCHEDULE_HEADERS,
    ...SCHEDULE_EXAMPLES,
  ]);
  XLSX.utils.book_append_sheet(wb, scheduleWs, "schedule");

  return wb;
}

export function buildScheduleTemplateBase64(): string {
  const wb = buildScheduleImportTemplateWorkbook();
  return XLSX.write(wb, { type: "base64", bookType: "xlsx" });
}

export async function shareScheduleImportTemplate(): Promise<void> {
  const base64 = buildScheduleTemplateBase64();

  if (Platform.OS === "web") {
    downloadBase64AsFile(
      base64,
      SCHEDULE_TEMPLATE_FILENAME,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    return;
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Sharing is not available on this device");
  }

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new Error("Cache directory is not available");
  }

  const path = `${cacheDir}${SCHEDULE_TEMPLATE_FILENAME}`;
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await Sharing.shareAsync(path, {
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    dialogTitle: `${APP_DISPLAY_NAME} schedule template`,
    UTI: "com.microsoft.excel.xlsx",
  });
}
