import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import { Platform } from "react-native";
import { downloadBase64AsFile } from "../utils/webFileDownload";
import {
  ImportKind,
  WORKBOOK_SHEET_ORDER,
} from "./adminExcelImport";
import { APP_DISPLAY_NAME } from "../constants/brand";

export const IMPORT_TEMPLATE_FILENAME = `${APP_DISPLAY_NAME.toLowerCase().replace(/\s+/g, "-")}-import-template.xlsx`;

/** Header row per sheet (must match import column names). */
export const TEMPLATE_SHEET_HEADERS: Record<ImportKind, string[]> = {
  classes: ["name"],
  schedule: [
    "className",
    "dayOfWeek",
    "startTime",
    "endTime",
    "subject",
    "teacherName",
    "sortOrder",
  ],
  users: ["email", "password", "name", "role", "phone"],
  student_class: ["studentEmail", "className"],
  teacher_class: ["teacherEmail", "className"],
  parent_student: ["parentEmail", "studentEmail"],
  homework: ["className", "subject", "title", "daysLeft", "details"],
  exams: ["className", "subject", "title", "marks", "details"],
  remarks: ["className", "studentEmail", "text", "type", "rating"],
  announcements: ["className", "title", "text"],
};

/** Optional example row (delete before import if you use real data). */
const TEMPLATE_EXAMPLE_ROWS: Partial<Record<ImportKind, string[]>> = {
  classes: ["Grade 10A"],
  schedule: [
    "Grade 10A",
    "monday",
    "08:00",
    "08:45",
    "Mathematics",
    "Ahmed",
    "0",
  ],
  users: [
    "student@school.com",
    "changeme123",
    "Jane Student",
    "student",
    "+252612345678",
  ],
  student_class: ["student@school.com", "Grade 10A"],
  teacher_class: ["teacher@school.com", "Grade 10A"],
  parent_student: ["parent@school.com", "student@school.com"],
  homework: ["Grade 10A", "Math", "Chapter 5 exercises", "3"],
  exams: ["Grade 10A", "Science", "Mid-term test", "50"],
  remarks: ["Grade 10A", "student@school.com", "Great progress", "performance", "4"],
  announcements: ["Grade 10A", "Parent meeting", "Meeting on Friday at 3pm."],
};

export function buildImportTemplateWorkbook(
  kinds: ImportKind[] = WORKBOOK_SHEET_ORDER,
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  for (const kind of kinds) {
    const headers = TEMPLATE_SHEET_HEADERS[kind];
    const example = TEMPLATE_EXAMPLE_ROWS[kind];
    const rows = example ? [headers, example] : [headers];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, kind);
  }

  return wb;
}

export function buildImportTemplateBase64(
  kinds?: ImportKind[],
): string {
  const wb = buildImportTemplateWorkbook(kinds);
  return XLSX.write(wb, { type: "base64", bookType: "xlsx" });
}

export const CLASS_STUDENTS_TEMPLATE_FILENAME = `${APP_DISPLAY_NAME.toLowerCase().replace(/\s+/g, "-")}-class-students-template.xlsx`;

/** Template for importing students into one selected class (class comes from the UI). */
export function buildClassStudentsImportTemplateBase64(): string {
  const wb = XLSX.utils.book_new();
  const rows = [
    ["email", "password", "name", "phone"],
    ["student@school.com", "123456", "Jane Student", "+252612345678"],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "students");
  return XLSX.write(wb, { type: "base64", bookType: "xlsx" });
}

async function shareBase64Xlsx(
  base64: string,
  filename: string,
  dialogTitle: string,
): Promise<void> {
  if (Platform.OS === "web") {
    downloadBase64AsFile(
      base64,
      filename,
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

  const path = `${cacheDir}${filename}`;

  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await Sharing.shareAsync(path, {
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    dialogTitle,
    UTI: "com.microsoft.excel.xlsx",
  });
}

export async function shareClassStudentsImportTemplate(): Promise<void> {
  await shareBase64Xlsx(
    buildClassStudentsImportTemplateBase64(),
    CLASS_STUDENTS_TEMPLATE_FILENAME,
    `${APP_DISPLAY_NAME} class students template`,
  );
}

export async function shareImportTemplate(
  kinds?: ImportKind[],
): Promise<void> {
  await shareBase64Xlsx(
    buildImportTemplateBase64(kinds),
    IMPORT_TEMPLATE_FILENAME,
    `${APP_DISPLAY_NAME} import template`,
  );
}
