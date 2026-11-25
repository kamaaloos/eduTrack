import { collection, getDocs } from "firebase/firestore";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import * as XLSX from "xlsx";
import { APP_DISPLAY_NAME } from "../constants/brand";
import type { UserData } from "../../hooks/useAdminUsers";
import { downloadBase64AsFile } from "../utils/webFileDownload";
import { requireSchoolDb } from "./firebase";

export const FAMILIES_EXPORT_FILENAME = `${APP_DISPLAY_NAME.toLowerCase().replace(/\s+/g, "-")}-students-parents-export.xlsx`;

export type FamiliesExportSummary = {
  students: number;
  parents: number;
  parentStudentLinks: number;
  filename: string;
};

type ClassRow = { id: string; name: string };

async function loadExportSourceData(): Promise<{
  students: UserData[];
  parents: UserData[];
  classes: ClassRow[];
  links: { parentId: string; studentId: string }[];
}> {
  const schoolDb = requireSchoolDb();
  const [usersSnap, classesSnap, linksSnap] = await Promise.all([
    getDocs(collection(schoolDb, "users")),
    getDocs(collection(schoolDb, "classes")),
    getDocs(collection(schoolDb, "parentStudents")),
  ]);

  const users = usersSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as UserData[];

  const students = users.filter((u) => u.role === "student");
  const parents = users.filter((u) => u.role === "parent");
  const classes = classesSnap.docs.map((d) => ({
    id: d.id,
    name: String((d.data().name as string | undefined) || d.id).trim(),
  }));

  const links: { parentId: string; studentId: string }[] = [];
  const seen = new Set<string>();
  for (const linkDoc of linksSnap.docs) {
    const data = linkDoc.data();
    let parentId = data.parentId as string | undefined;
    let studentId = data.studentId as string | undefined;

    if (!parentId && studentId && linkDoc.id.length > 0) {
      parentId = linkDoc.id;
    }
    if ((!parentId || !studentId) && linkDoc.id.includes("_")) {
      const idx = linkDoc.id.indexOf("_");
      parentId = parentId || linkDoc.id.slice(0, idx);
      studentId = studentId || linkDoc.id.slice(idx + 1);
    }
    if (!parentId || !studentId) continue;
    const key = `${parentId}_${studentId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ parentId, studentId });
  }

  return { students, parents, classes, links };
}

export function buildStudentsParentsExportWorkbook(input: {
  students: UserData[];
  parents: UserData[];
  classes: ClassRow[];
  links: { parentId: string; studentId: string }[];
}): XLSX.WorkBook {
  const classesMap = new Map(input.classes.map((c) => [c.id, c.name]));
  const studentsMap = new Map(input.students.map((u) => [u.id, u]));
  const parentsMap = new Map(input.parents.map((u) => [u.id, u]));
  const allUsersMap = new Map<string, UserData>([
    ...studentsMap,
    ...parentsMap,
  ]);

  const studentRows: (string | number)[][] = [
    ["email", "name", "phone", "className", "classId"],
  ];
  const sortedStudents = [...input.students].sort((a, b) =>
    (a.name || a.email || "").localeCompare(b.name || b.email || "", undefined, {
      sensitivity: "base",
    }),
  );
  for (const s of sortedStudents) {
    const classId = typeof s.classId === "string" ? s.classId : "";
    studentRows.push([
      (s.email || "").trim(),
      (s.name || "").trim(),
      typeof s.phone === "string" ? s.phone.trim() : "",
      classId ? classesMap.get(classId) || "" : "",
      classId,
    ]);
  }

  const parentRows: (string | number)[][] = [["email", "name", "phone"]];
  const sortedParents = [...input.parents].sort((a, b) =>
    (a.name || a.email || "").localeCompare(b.name || b.email || "", undefined, {
      sensitivity: "base",
    }),
  );
  for (const p of sortedParents) {
    parentRows.push([
      (p.email || "").trim(),
      (p.name || "").trim(),
      typeof p.phone === "string" ? p.phone.trim() : "",
    ]);
  }

  const linkRows: (string | number)[][] = [
    ["parentEmail", "studentEmail", "parentName", "studentName"],
  ];
  const sortedLinks = [...input.links].sort((a, b) => {
    const pa = allUsersMap.get(a.parentId);
    const pb = allUsersMap.get(b.parentId);
    return (pa?.email || a.parentId).localeCompare(
      pb?.email || b.parentId,
      undefined,
      { sensitivity: "base" },
    );
  });
  for (const link of sortedLinks) {
    const parent = allUsersMap.get(link.parentId);
    const student = allUsersMap.get(link.studentId);
    linkRows.push([
      (parent?.email || "").trim(),
      (student?.email || "").trim(),
      (parent?.name || "").trim(),
      (student?.name || "").trim(),
    ]);
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(studentRows),
    "students",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(parentRows),
    "parents",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(linkRows),
    "parent_student",
  );
  return wb;
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

/** Load live school data and download/share Excel (students, parents, parent_student). */
export async function exportStudentsParentsWorkbook(): Promise<FamiliesExportSummary> {
  const data = await loadExportSourceData();
  const wb = buildStudentsParentsExportWorkbook(data);
  const base64 = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
  await shareBase64Xlsx(
    base64,
    FAMILIES_EXPORT_FILENAME,
    `${APP_DISPLAY_NAME} students & parents export`,
  );

  return {
    students: data.students.length,
    parents: data.parents.length,
    parentStudentLinks: data.links.length,
    filename: FAMILIES_EXPORT_FILENAME,
  };
}
