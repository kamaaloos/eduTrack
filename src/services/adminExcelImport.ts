import {
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import * as XLSX from "xlsx";
import { db, ensureAdminCreateAuth } from "./firebase";
import { upsertParentStudentLink } from "./parentStudentLinks";

export type ImportKind =
  | "classes"
  | "users"
  | "student_class"
  | "teacher_class"
  | "parent_student"
  | "homework"
  | "exams"
  | "remarks"
  | "announcements";

export const IMPORT_KINDS: ImportKind[] = [
  "classes",
  "users",
  "student_class",
  "teacher_class",
  "parent_student",
  "homework",
  "exams",
  "remarks",
  "announcements",
];

export const WORKBOOK_SHEET_ORDER: ImportKind[] = [
  "classes",
  "users",
  "student_class",
  "teacher_class",
  "parent_student",
  "homework",
  "exams",
  "remarks",
  "announcements",
];

export type ParsedWorkbook = {
  sheets: Partial<Record<ImportKind, Record<string, unknown>[]>>;
  sheetNames: string[];
  unknownSheets: string[];
};

export type ImportSummary = {
  kind: ImportKind | "workbook";
  created: number;
  skipped: number;
  errors: string[];
};

type ImportRow = Record<string, unknown>;

type UserCache = { id: string; role: string; name: string; email: string };

type ImportContext = {
  classByName: Map<string, string>;
  userByEmail: Map<string, UserCache>;
};

function normalizeKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function normalizeSheetName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "_");
}

const SHEET_ALIASES: Record<string, ImportKind> = {
  class: "classes",
  classes: "classes",
  user: "users",
  users: "users",
  student_class: "student_class",
  student_classes: "student_class",
  studentclass: "student_class",
  teacher_class: "teacher_class",
  teacher_classes: "teacher_class",
  teacherclass: "teacher_class",
  parent_student: "parent_student",
  parent_students: "parent_student",
  parentstudent: "parent_student",
  homework: "homework",
  homeworks: "homework",
  exam: "exams",
  exams: "exams",
  remark: "remarks",
  remarks: "remarks",
  announcement: "announcements",
  announcements: "announcements",
};

function sheetNameToKind(name: string): ImportKind | null {
  const key = normalizeSheetName(name);
  return SHEET_ALIASES[key] ?? null;
}

function rowsFromSheet(sheet: XLSX.WorkSheet): ImportRow[] {
  const json = XLSX.utils.sheet_to_json<ImportRow>(sheet, {
    defval: "",
    raw: false,
  });
  return json.map((row) => {
    const out: ImportRow = {};
    for (const [k, v] of Object.entries(row)) {
      out[normalizeKey(k)] = v;
    }
    return out;
  });
}

export function parseWorkbookFromArrayBuffer(
  data: ArrayBuffer,
  singleSheetKind?: ImportKind,
): ParsedWorkbook {
  const wb = XLSX.read(data, { type: "array" });
  const sheets: Partial<Record<ImportKind, ImportRow[]>> = {};
  const unknownSheets: string[] = [];

  if (singleSheetKind && wb.SheetNames.length > 0) {
    const first = wb.SheetNames[0];
    sheets[singleSheetKind] = rowsFromSheet(wb.Sheets[first]);
    for (let i = 1; i < wb.SheetNames.length; i++) {
      const name = wb.SheetNames[i];
      const rows = rowsFromSheet(wb.Sheets[name]);
      if (rows.length > 0) unknownSheets.push(name);
    }
    return {
      sheets,
      sheetNames: wb.SheetNames,
      unknownSheets,
    };
  }

  for (const sheetName of wb.SheetNames) {
    const kind = sheetNameToKind(sheetName);
    const rows = rowsFromSheet(wb.Sheets[sheetName]);
    if (!kind) {
      if (rows.length > 0) unknownSheets.push(sheetName);
      continue;
    }
    const existing = sheets[kind] ?? [];
    sheets[kind] = [...existing, ...rows];
  }

  return {
    sheets,
    sheetNames: wb.SheetNames,
    unknownSheets,
  };
}

export function getImportableRowCount(parsed: ParsedWorkbook): number {
  return WORKBOOK_SHEET_ORDER.reduce(
    (sum, kind) => sum + (parsed.sheets[kind]?.length ?? 0),
    0,
  );
}

/** Shown when the file opened but no sheet names / rows matched our import format. */
export function formatWorkbookPickHint(parsed: ParsedWorkbook): string | null {
  if (getImportableRowCount(parsed) > 0) return null;
  const names =
    parsed.sheetNames.length > 0 ? parsed.sheetNames.join(", ") : "(empty file)";
  return `No importable data found. Sheets in your file: ${names}. Rename tabs to classes, users, student_class, etc., or tap "Download full template (.xlsx)".`;
}

function cell(row: ImportRow, ...keys: string[]): string {
  for (const key of keys) {
    const v = row[normalizeKey(key)];
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return "";
}

function num(row: ImportRow, ...keys: string[]): number | null {
  const s = cell(row, ...keys);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

async function buildContext(): Promise<ImportContext> {
  const [classesSnap, usersSnap] = await Promise.all([
    getDocs(collection(db, "classes")),
    getDocs(collection(db, "users")),
  ]);

  const classByName = new Map<string, string>();
  for (const d of classesSnap.docs) {
    const name = (d.data().name as string | undefined)?.trim();
    if (name) classByName.set(name.toLowerCase(), d.id);
  }

  const userByEmail = new Map<string, UserCache>();
  for (const d of usersSnap.docs) {
    const data = d.data();
    const email = (data.email as string | undefined)?.trim().toLowerCase();
    if (!email) continue;
    userByEmail.set(email, {
      id: d.id,
      role: String(data.role ?? ""),
      name: String(data.name ?? email),
      email,
    });
  }

  return { classByName, userByEmail };
}

function resolveClassId(
  ctx: ImportContext,
  row: ImportRow,
  rowNum: number,
  errors: string[],
): string | null {
  const classId = cell(row, "classId", "class_id");
  if (classId) return classId;

  const className = cell(row, "className", "class_name", "class");
  if (!className) {
    errors.push(`Row ${rowNum}: missing className or classId`);
    return null;
  }
  const id = ctx.classByName.get(className.toLowerCase());
  if (!id) {
    errors.push(`Row ${rowNum}: class "${className}" not found`);
    return null;
  }
  return id;
}

function resolveUserId(
  ctx: ImportContext,
  row: ImportRow,
  rowNum: number,
  field: string,
  aliases: string[],
  errors: string[],
  expectedRole?: string,
): string | null {
  const directId = cell(row, `${field}Id`, `${field}_id`);
  if (directId) return directId;

  const email = cell(row, `${field}Email`, `${field}_email`, field, ...aliases);
  if (!email) {
    errors.push(`Row ${rowNum}: missing ${field} email or id`);
    return null;
  }
  const user = ctx.userByEmail.get(email.toLowerCase());
  if (!user) {
    errors.push(`Row ${rowNum}: ${field} "${email}" not found`);
    return null;
  }
  if (expectedRole && user.role !== expectedRole) {
    errors.push(
      `Row ${rowNum}: "${email}" is not a ${expectedRole} (role: ${user.role})`,
    );
    return null;
  }
  return user.id;
}

async function importClasses(
  rows: ImportRow[],
  ctx: ImportContext,
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    kind: "classes",
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const name = cell(row, "name", "className", "class_name", "class");
    if (!name) {
      summary.skipped++;
      continue;
    }
    const key = name.toLowerCase();
    if (ctx.classByName.has(key)) {
      summary.skipped++;
      continue;
    }
    try {
      const ref = await addDoc(collection(db, "classes"), {
        name,
        createdAt: serverTimestamp(),
      });
      ctx.classByName.set(key, ref.id);
      summary.created++;
    } catch (e) {
      summary.errors.push(
        `Row ${rowNum}: ${e instanceof Error ? e.message : "failed"}`,
      );
    }
  }

  return summary;
}

async function importUsers(
  rows: ImportRow[],
  ctx: ImportContext,
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    kind: "users",
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const email = cell(row, "email").toLowerCase();
    const password = cell(row, "password");
    const name = cell(row, "name");
    const role = cell(row, "role").toLowerCase() as
      | "student"
      | "teacher"
      | "parent"
      | "admin"
      | "";

    if (!email || !password || !name || !role) {
      summary.skipped++;
      summary.errors.push(`Row ${rowNum}: email, password, name, role required`);
      continue;
    }
    if (!["student", "teacher", "parent", "admin"].includes(role)) {
      summary.errors.push(`Row ${rowNum}: invalid role "${role}"`);
      continue;
    }
    if (ctx.userByEmail.has(email)) {
      summary.skipped++;
      continue;
    }
    if (password.length < 6) {
      summary.errors.push(`Row ${rowNum}: password must be at least 6 chars`);
      continue;
    }

    try {
      const secondaryAuth = ensureAdminCreateAuth();
      if (!secondaryAuth) {
        summary.errors.push(`Row ${rowNum}: school connection not ready`);
        continue;
      }

      const userCred = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password,
      );
      await setDoc(doc(db, "users", userCred.user.uid), {
        name,
        email,
        role,
        mustChangePassword: true,
        createdAt: new Date(),
      });
      await signOut(secondaryAuth).catch(() => {});
      ctx.userByEmail.set(email, {
        id: userCred.user.uid,
        role,
        name,
        email,
      });
      summary.created++;
    } catch (e) {
      summary.errors.push(
        `Row ${rowNum}: ${e instanceof Error ? e.message : "failed"}`,
      );
    }
  }

  return summary;
}

async function importStudentClass(
  rows: ImportRow[],
  ctx: ImportContext,
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    kind: "student_class",
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const studentId = resolveUserId(
      ctx,
      row,
      rowNum,
      "student",
      ["studentEmail", "student_email"],
      summary.errors,
      "student",
    );
    const classId = resolveClassId(ctx, row, rowNum, summary.errors);
    if (!studentId || !classId) continue;

    const linkId = `${studentId}_${classId}`;
    try {
      await setDoc(
        doc(db, "studentClasses", linkId),
        { studentId, classId, createdAt: serverTimestamp() },
        { merge: true },
      );
      await setDoc(doc(db, "users", studentId), { classId }, { merge: true });
      summary.created++;
    } catch (e) {
      summary.errors.push(
        `Row ${rowNum}: ${e instanceof Error ? e.message : "failed"}`,
      );
    }
  }

  return summary;
}

async function importTeacherClass(
  rows: ImportRow[],
  ctx: ImportContext,
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    kind: "teacher_class",
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const teacherId = resolveUserId(
      ctx,
      row,
      rowNum,
      "teacher",
      ["teacherEmail", "teacher_email"],
      summary.errors,
      "teacher",
    );
    const classId = resolveClassId(ctx, row, rowNum, summary.errors);
    if (!teacherId || !classId) continue;

    const linkId = `${teacherId}_${classId}`;
    try {
      await setDoc(
        doc(db, "teacherClasses", linkId),
        { teacherId, classId, createdAt: serverTimestamp() },
        { merge: true },
      );
      summary.created++;
    } catch (e) {
      summary.errors.push(
        `Row ${rowNum}: ${e instanceof Error ? e.message : "failed"}`,
      );
    }
  }

  return summary;
}

async function importParentStudent(
  rows: ImportRow[],
  ctx: ImportContext,
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    kind: "parent_student",
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const parentId = resolveUserId(
      ctx,
      row,
      rowNum,
      "parent",
      ["parentEmail", "parent_email"],
      summary.errors,
      "parent",
    );
    const studentId = resolveUserId(
      ctx,
      row,
      rowNum,
      "student",
      ["studentEmail", "student_email"],
      summary.errors,
      "student",
    );
    if (!parentId || !studentId) continue;

    try {
      await upsertParentStudentLink(parentId, studentId);
      summary.created++;
    } catch (e) {
      summary.errors.push(
        `Row ${rowNum}: ${e instanceof Error ? e.message : "failed"}`,
      );
    }
  }

  return summary;
}

async function importHomework(
  rows: ImportRow[],
  ctx: ImportContext,
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    kind: "homework",
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const classId = resolveClassId(ctx, row, rowNum, summary.errors);
    const subject = cell(row, "subject");
    const title = cell(row, "title");
    const daysLeft = num(row, "daysLeft", "days_left", "days");
    if (!classId) continue;
    if (!subject || !title || daysLeft === null) {
      summary.errors.push(
        `Row ${rowNum}: subject, title, and daysLeft required`,
      );
      continue;
    }

    const teacherEmail = cell(row, "teacherEmail", "teacher_email");
    const teacher = teacherEmail
      ? ctx.userByEmail.get(teacherEmail.toLowerCase())
      : undefined;

    try {
      const details = cell(row, "details", "description");
      await addDoc(collection(db, "classes", classId, "homework"), {
        subject,
        title,
        daysLeft,
        ...(details ? { details } : {}),
        classId,
        teacherId: teacher?.id ?? null,
        teacherName: teacher?.name ?? "Import",
        importedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      summary.created++;
    } catch (e) {
      summary.errors.push(
        `Row ${rowNum}: ${e instanceof Error ? e.message : "failed"}`,
      );
    }
  }

  return summary;
}

async function importExams(
  rows: ImportRow[],
  ctx: ImportContext,
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    kind: "exams",
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const classId = resolveClassId(ctx, row, rowNum, summary.errors);
    const subject = cell(row, "subject");
    const title = cell(row, "title");
    const marks = num(row, "marks");
    if (!classId) continue;
    if (!subject || !title || marks === null) {
      summary.errors.push(`Row ${rowNum}: subject, title, and marks required`);
      continue;
    }

    const teacherEmail = cell(row, "teacherEmail", "teacher_email");
    const teacher = teacherEmail
      ? ctx.userByEmail.get(teacherEmail.toLowerCase())
      : undefined;

    try {
      const details = cell(row, "details", "description");
      await addDoc(collection(db, "classes", classId, "exams"), {
        subject,
        title,
        marks,
        ...(details ? { details } : {}),
        classId,
        teacherId: teacher?.id ?? null,
        importedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      summary.created++;
    } catch (e) {
      summary.errors.push(
        `Row ${rowNum}: ${e instanceof Error ? e.message : "failed"}`,
      );
    }
  }

  return summary;
}

async function importRemarks(
  rows: ImportRow[],
  ctx: ImportContext,
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    kind: "remarks",
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const classId = resolveClassId(ctx, row, rowNum, summary.errors);
    const studentId = resolveUserId(
      ctx,
      row,
      rowNum,
      "student",
      ["studentEmail", "student_email"],
      summary.errors,
      "student",
    );
    const text = cell(row, "text", "remark");
    if (!classId || !studentId) continue;
    if (!text) {
      summary.errors.push(`Row ${rowNum}: text required`);
      continue;
    }

    const studentEntry = [...ctx.userByEmail.values()].find(
      (u) => u.id === studentId,
    );
    const type = cell(row, "type") || "performance";
    const rating = num(row, "rating");

    try {
      await addDoc(collection(db, "classes", classId, "remarks"), {
        studentId,
        studentName: studentEntry?.name ?? "Student",
        classId,
        text,
        remark: text,
        type,
        rating,
        teacherName: "Import",
        importedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      summary.created++;
    } catch (e) {
      summary.errors.push(
        `Row ${rowNum}: ${e instanceof Error ? e.message : "failed"}`,
      );
    }
  }

  return summary;
}

async function importAnnouncements(
  rows: ImportRow[],
  ctx: ImportContext,
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    kind: "announcements",
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const classId = resolveClassId(ctx, row, rowNum, summary.errors);
    const title = cell(row, "title");
    const text = cell(row, "text", "message");
    if (!classId) continue;
    if (!title || !text) {
      summary.errors.push(`Row ${rowNum}: title and text required`);
      continue;
    }

    const teacherEmail = cell(row, "teacherEmail", "teacher_email");
    const teacher = teacherEmail
      ? ctx.userByEmail.get(teacherEmail.toLowerCase())
      : undefined;

    try {
      await addDoc(collection(db, "classes", classId, "announcements"), {
        title,
        text,
        message: text,
        icon: "📢",
        classId,
        teacherId: teacher?.id ?? null,
        importedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      summary.created++;
    } catch (e) {
      summary.errors.push(
        `Row ${rowNum}: ${e instanceof Error ? e.message : "failed"}`,
      );
    }
  }

  return summary;
}

const IMPORT_HANDLERS: Record<
  ImportKind,
  (rows: ImportRow[], ctx: ImportContext) => Promise<ImportSummary>
> = {
  classes: importClasses,
  users: importUsers,
  student_class: importStudentClass,
  teacher_class: importTeacherClass,
  parent_student: importParentStudent,
  homework: importHomework,
  exams: importExams,
  remarks: importRemarks,
  announcements: importAnnouncements,
};

export async function runImportKind(
  kind: ImportKind,
  rows: ImportRow[],
): Promise<ImportSummary> {
  const ctx = await buildContext();
  return IMPORT_HANDLERS[kind](rows, ctx);
}

export async function runWorkbookImport(
  parsed: ParsedWorkbook,
): Promise<ImportSummary[]> {
  const ctx = await buildContext();
  const results: ImportSummary[] = [];

  for (const kind of WORKBOOK_SHEET_ORDER) {
    const rows = parsed.sheets[kind];
    if (!rows?.length) continue;
    results.push(await IMPORT_HANDLERS[kind](rows, ctx));
  }

  return results;
}

export const IMPORT_FORMAT_HINTS: Record<ImportKind, string> = {
  classes: "Columns: name",
  users: "Columns: email, password, name, role (student|teacher|parent|admin)",
  student_class: "Columns: studentEmail, className",
  teacher_class: "Columns: teacherEmail, className",
  parent_student: "Columns: parentEmail, studentEmail",
  homework: "Columns: className, subject, title, daysLeft, details (optional)",
  exams: "Columns: className, subject, title, marks, details (optional)",
  remarks: "Columns: className, studentEmail, text, type (optional), rating (optional)",
  announcements: "Columns: className, title, text",
};
