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
import {
  normalizeTimeHHmm,
  parseDayOfWeek,
  parseHHmmToMinutes,
} from "../utils/scheduleFormat";

export type ImportKind =
  | "classes"
  | "schedule"
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
  "schedule",
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
  "schedule",
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

const USER_CREATE_GAP_MS = 700;
const AUTH_RATE_LIMIT_RETRIES = 5;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAuthRateLimited(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? "");
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code?: string }).code ?? "")
      : "";
  return (
    code.includes("too-many-requests") ||
    message.includes("too-many-requests") ||
    message.includes("TOO_MANY_ATTEMPTS")
  );
}

function isEmailAlreadyInUse(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? "");
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code?: string }).code ?? "")
      : "";
  return (
    code.includes("email-already-in-use") ||
    message.includes("email-already-in-use")
  );
}

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
  schedule: "schedule",
  schedules: "schedule",
  timetable: "schedule",
  class_schedule: "schedule",
  user: "users",
  users: "users",
  student_class: "student_class",
  student_classes: "student_class",
  studentclass: "student_class",
  teacher_class: "teacher_class",
  teacher_classes: "teacher_class",
  teacherclass: "teacher_class",
  teacher_class_links: "teacher_class",
  teachers_classes: "teacher_class",
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

function stripMailto(value: string): string {
  return value.replace(/^mailto:/i, "").trim();
}

function cellToImportString(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string" || typeof value === "number") {
    return stripMailto(String(value).trim());
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.text === "string" && record.text.trim()) {
      return stripMailto(record.text.trim());
    }
    if (typeof record.hyperlink === "string" && record.hyperlink.trim()) {
      return stripMailto(record.hyperlink.trim());
    }
  }
  return stripMailto(String(value).trim());
}

/**
 * Excel often auto-converts emails to mailto hyperlinks. Display text can be
 * empty while the address lives on `!hyperlinks` and/or `cell.l.Target`.
 */
function collectMailtoByHeader(
  sheet: XLSX.WorkSheet,
  json: ImportRow[],
): Map<string, Map<number, string>> {
  const mailtoByHeader = new Map<string, Map<number, string>>();

  const setMailto = (header: string | undefined, dataRowIndex: number, target: string) => {
    if (!header || dataRowIndex < 0) return;
    const byRow = mailtoByHeader.get(header) ?? new Map<number, string>();
    byRow.set(dataRowIndex, stripMailto(target));
    mailtoByHeader.set(header, byRow);
  };

  const hyperlinks = (
    sheet as XLSX.WorkSheet & {
      "!hyperlinks"?: { ref?: string; Target?: string; target?: string }[];
    }
  )["!hyperlinks"];

  const ref = sheet["!ref"];
  const headerByCol = new Map<number, string>();
  if (ref) {
    const range = XLSX.utils.decode_range(ref);
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: range.s.r, c: C });
      const cell = sheet[addr];
      if (!cell) continue;
      const header = String(cell.w ?? cell.v ?? "").replace(/^\uFEFF/, "").trim();
      if (header) headerByCol.set(C, header);
    }

    // Prefer cell-level links (common when Excel auto-detects emails).
    for (let R = range.s.r + 1; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = sheet[addr] as XLSX.CellObject & {
          l?: { Target?: string; target?: string };
        };
        const target = String(cell?.l?.Target ?? cell?.l?.target ?? "").trim();
        if (!/^mailto:/i.test(target)) continue;
        setMailto(headerByCol.get(C), R - range.s.r - 1, target);
      }
    }
  }

  if (hyperlinks?.length) {
    for (const link of hyperlinks) {
      const target = String(link.Target ?? link.target ?? "").trim();
      if (!/^mailto:/i.test(target) || !link.ref) continue;
      try {
        const addr = XLSX.utils.decode_cell(link.ref.split(":")[0]);
        const header =
          headerByCol.get(addr.c) ?? Object.keys(json[0] ?? {})[addr.c];
        setMailto(header, addr.r - 1, target);
      } catch {
        /* ignore bad link refs */
      }
    }
  }

  return mailtoByHeader;
}

const HEADER_HINT_KEYS = new Set([
  "classname",
  "class_name",
  "class",
  "dayofweek",
  "day_of_week",
  "day",
  "starttime",
  "endtime",
  "subject",
  "teachername",
  "teacheremail",
  "studentemail",
  "parentemail",
  "email",
  "password",
  "name",
  "role",
]);

function scoreHeaderRow(cells: unknown[]): number {
  let score = 0;
  for (const value of cells) {
    const key = normalizeKey(String(value ?? "").replace(/^\uFEFF/, ""));
    if (HEADER_HINT_KEYS.has(key)) score += 2;
    else if (key.includes("class") || key.includes("email") || key.includes("day"))
      score += 1;
  }
  return score;
}

function rowsFromSheet(sheet: XLSX.WorkSheet): ImportRow[] {
  const matrix = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
    sheet,
    {
      header: 1,
      defval: "",
      raw: false,
      blankrows: false,
    },
  );

  if (matrix.length === 0) return [];

  // Prefer a real header row (skips title/blank rows above the template).
  let headerRowIndex = 0;
  let bestScore = scoreHeaderRow(matrix[0] ?? []);
  const scanLimit = Math.min(matrix.length, 8);
  for (let i = 1; i < scanLimit; i++) {
    const score = scoreHeaderRow(matrix[i] ?? []);
    if (score > bestScore) {
      bestScore = score;
      headerRowIndex = i;
    }
  }

  const headerCells = (matrix[headerRowIndex] ?? []).map((value) =>
    String(value ?? "").replace(/^\uFEFF/, "").trim(),
  );
  const headers = headerCells.map((value) => normalizeKey(value));

  const jsonFallback = XLSX.utils.sheet_to_json<ImportRow>(sheet, {
    defval: "",
    raw: false,
    blankrows: false,
  });
  const mailtoByHeader = collectMailtoByHeader(sheet, jsonFallback);

  const rows: ImportRow[] = [];
  for (let r = headerRowIndex + 1; r < matrix.length; r++) {
    const line = matrix[r] ?? [];
    const out: ImportRow = {};
    let hasValue = false;
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (!key || key.startsWith("__empty")) continue;
      const rawHeader = headerCells[c] || key;
      let text = cellToImportString(line[c]);
      if (!text) {
        text =
          mailtoByHeader.get(rawHeader)?.get(r - headerRowIndex - 1) ??
          mailtoByHeader.get(rawHeader)?.get(r - 1) ??
          "";
      }
      if (text) hasValue = true;
      // Keep first non-empty value if duplicate headers collide after normalize.
      if (!out[key] || !String(out[key]).trim()) {
        out[key] = text;
      }
    }
    if (hasValue) rows.push(out);
  }

  return rows;
}

function firstEmailLikeValues(row: ImportRow): string[] {
  const emails: string[] = [];
  for (const value of Object.values(row)) {
    const text = cellToImportString(value);
    if (text.includes("@")) emails.push(text.toLowerCase());
  }
  return emails;
}

/**
 * If headers were not recognized, recover teacher_class rows from values:
 * first email-looking cell → teacherEmail, first non-email cell → className.
 */
function coerceTeacherClassRow(row: ImportRow): ImportRow {
  const hasEmail = Boolean(
    cell(
      row,
      "teacherEmail",
      "teacher_email",
      "teacheremail",
      "email",
      "mail",
    ),
  );
  const hasClass = Boolean(
    cell(row, "className", "class_name", "class", "classname", "grade"),
  );
  if (hasEmail && hasClass) return row;

  let email = "";
  let className = "";
  for (const value of Object.values(row)) {
    const text = cellToImportString(value);
    if (!text) continue;
    if (!email && text.includes("@")) {
      email = text.toLowerCase();
      continue;
    }
    if (!className && !text.includes("@")) {
      className = text;
    }
  }

  return {
    ...row,
    ...(email ? { teacheremail: email } : null),
    ...(className ? { classname: className } : null),
  };
}

/** Recover student_class when headers are off: first email → student, first non-email → class. */
function coerceStudentClassRow(row: ImportRow): ImportRow {
  const hasEmail = Boolean(
    cell(row, "studentEmail", "student_email", "studentemail", "email", "mail"),
  );
  const hasClass = Boolean(
    cell(row, "className", "class_name", "class", "classname", "grade"),
  );
  if (hasEmail && hasClass) return row;

  let email = "";
  let className = "";
  for (const value of Object.values(row)) {
    const text = cellToImportString(value);
    if (!text) continue;
    if (!email && text.includes("@")) {
      email = text.toLowerCase();
      continue;
    }
    if (!className && !text.includes("@")) {
      className = text;
    }
  }

  return {
    ...row,
    ...(email ? { studentemail: email } : null),
    ...(className ? { classname: className } : null),
  };
}

/** Recover parent_student when headers are off: first email → parent, second → student. */
function coerceParentStudentRow(row: ImportRow): ImportRow {
  const hasParent = Boolean(
    cell(row, "parentEmail", "parent_email", "parentemail"),
  );
  const hasStudent = Boolean(
    cell(row, "studentEmail", "student_email", "studentemail"),
  );
  if (hasParent && hasStudent) return row;

  const emails = firstEmailLikeValues(row);
  return {
    ...row,
    ...(emails[0] ? { parentemail: emails[0] } : null),
    ...(emails[1] ? { studentemail: emails[1] } : null),
  };
}

const DAY_NAME_HINTS = new Set([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
]);

/** Recover schedule rows when className header was lost/misread. */
function coerceScheduleRow(row: ImportRow): ImportRow {
  const hasClass = Boolean(
    cell(
      row,
      "className",
      "class_name",
      "class",
      "classname",
      "grade",
      "gradeName",
      "grade_name",
      "luokka",
      "name",
    ),
  );
  if (hasClass) {
    // Classes sheets use `name`; map to className when schedule fields exist.
    const named = cell(row, "name");
    const classNamed = cell(row, "className", "class_name", "classname");
    if (named && !classNamed && rowLooksLikeSchedule(row)) {
      return { ...row, classname: named };
    }
    return row;
  }

  let className = "";
  for (const value of Object.values(row)) {
    const text = cellToImportString(value);
    if (!text) continue;
    if (text.includes("@")) continue;
    if (DAY_NAME_HINTS.has(text.toLowerCase())) continue;
    if (/^\d{1,2}:\d{2}/.test(text)) continue;
    // Prefer values that look like class labels (letters / punctuation).
    if (!/[A-Za-zÀ-ÿ]/.test(text)) continue;
    className = text;
    break;
  }

  return {
    ...row,
    ...(className ? { classname: className } : null),
  };
}

function normalizeClassLookupKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[’']/g, "'")
    .trim();
}

function findSheetNameForKind(
  sheetNames: string[],
  kind: ImportKind,
): string | null {
  for (const name of sheetNames) {
    if (sheetNameToKind(name) === kind) return name;
  }
  return null;
}

/** True when a row has schedule fields (not just classes `name`). */
function rowLooksLikeSchedule(row: ImportRow): boolean {
  return Boolean(
    cell(row, "className", "class_name", "classname") ||
      cell(row, "dayOfWeek", "day_of_week", "day") ||
      cell(row, "startTime", "start_time", "start") ||
      cell(row, "endTime", "end_time", "end") ||
      cell(row, "subject"),
  );
}

export function parseWorkbookFromArrayBuffer(
  data: ArrayBuffer,
  singleSheetKind?: ImportKind,
): ParsedWorkbook {
  const wb = XLSX.read(data, { type: "array" });
  const sheets: Partial<Record<ImportKind, ImportRow[]>> = {};
  const unknownSheets: string[] = [];

  if (singleSheetKind && wb.SheetNames.length > 0) {
    // Prefer a tab named for this kind (e.g. "schedule") so full-template
    // uploads don't import the first "classes" sheet as schedule.
    const matched =
      findSheetNameForKind(wb.SheetNames, singleSheetKind) ?? wb.SheetNames[0];
    sheets[singleSheetKind] = rowsFromSheet(wb.Sheets[matched]);
    for (const name of wb.SheetNames) {
      if (name === matched) continue;
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

/** Fallback when headers are close but not exact (e.g. "Teacher E-mail Address"). */
function cellByKeyMatch(
  row: ImportRow,
  match: (normalizedKey: string) => boolean,
): string {
  for (const [key, value] of Object.entries(row)) {
    if (!match(key)) continue;
    if (value === undefined || value === null) continue;
    const s = String(value).trim();
    if (s) return s;
  }
  return "";
}

function rowColumnHint(row: ImportRow): string {
  const keys = Object.keys(row);
  return keys.length > 0 ? keys.join(", ") : "(no columns)";
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
    if (!name) continue;
    classByName.set(name.toLowerCase(), d.id);
    classByName.set(normalizeClassLookupKey(name), d.id);
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
  const classId = cell(
    row,
    "classId",
    "class_id",
    "classid",
    "id_class",
  );
  if (classId) return classId;

  let className = cell(
    row,
    "className",
    "class_name",
    "class",
    "classname",
    "grade",
    "gradeName",
    "grade_name",
    "luokka",
    "class name",
    "Class Name",
    "name",
  );
  if (!className) {
    className = cellByKeyMatch(
      row,
      (key) =>
        (key.includes("class") || key.includes("grade") || key.includes("luokka")) &&
        !key.includes("teacher") &&
        !key.includes("student") &&
        !key.includes("email") &&
        !key.includes("day"),
    );
  }
  if (!className) {
    errors.push(
      `Row ${rowNum}: missing className or classId (columns: ${rowColumnHint(row)}). Use header className`,
    );
    return null;
  }
  const id =
    ctx.classByName.get(className.toLowerCase()) ??
    ctx.classByName.get(normalizeClassLookupKey(className));
  if (!id) {
    errors.push(
      `Row ${rowNum}: class "${className}" not found. Create it under Classes first (name must match exactly).`,
    );
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
  const directId = cell(row, `${field}Id`, `${field}_id`, `${field}id`);
  if (directId) return directId;

  let email = cell(
    row,
    `${field}Email`,
    `${field}_email`,
    `${field}email`,
    field,
    ...aliases,
  );
  if (!email) {
    email = cellByKeyMatch(row, (key) => {
      if (key.includes("password")) return false;
      if (field === "teacher") {
        return (
          (key.includes("teacher") &&
            (key.includes("email") || key.includes("mail"))) ||
          key === "email" ||
          key === "mail"
        );
      }
      if (field === "student") {
        return (
          key.includes("student") &&
          (key.includes("email") || key.includes("mail"))
        );
      }
      if (field === "parent") {
        return (
          key.includes("parent") &&
          (key.includes("email") || key.includes("mail"))
        );
      }
      return key.includes(field) && key.includes("email");
    });
  }
  if (!email) {
    errors.push(
      `Row ${rowNum}: missing ${field} email or id (columns: ${rowColumnHint(row)}). Use header ${field}Email`,
    );
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
    const phone = cell(row, "phone", "phone_number", "phonenumber");

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

    const secondaryAuth = ensureAdminCreateAuth();
    if (!secondaryAuth) {
      summary.errors.push(`Row ${rowNum}: school connection not ready`);
      continue;
    }

    let created = false;
    for (let attempt = 0; attempt <= AUTH_RATE_LIMIT_RETRIES; attempt++) {
      try {
        if (summary.created > 0 || attempt > 0) {
          await sleep(
            attempt === 0
              ? USER_CREATE_GAP_MS
              : Math.min(30_000, 4_000 * 2 ** (attempt - 1)),
          );
        }

        const userCred = await createUserWithEmailAndPassword(
          secondaryAuth,
          email,
          password,
        );
        const profile: Record<string, unknown> = {
          name,
          email,
          role,
          mustChangePassword: true,
          createdAt: new Date(),
        };
        if (phone) profile.phone = phone;

        await setDoc(doc(db, "users", userCred.user.uid), profile);
        await signOut(secondaryAuth).catch(() => {});
        ctx.userByEmail.set(email, {
          id: userCred.user.uid,
          role,
          name,
          email,
        });
        summary.created++;
        created = true;
        break;
      } catch (e) {
        await signOut(secondaryAuth).catch(() => {});

        if (isEmailAlreadyInUse(e)) {
          summary.skipped++;
          summary.errors.push(
            `Row ${rowNum}: ${email} already exists in Auth — skipped (re-run after rate limit clears, or create Firestore profile manually if missing)`,
          );
          created = true;
          break;
        }

        if (isAuthRateLimited(e) && attempt < AUTH_RATE_LIMIT_RETRIES) {
          continue;
        }

        const detail = e instanceof Error ? e.message : "failed";
        summary.errors.push(
          isAuthRateLimited(e)
            ? `Row ${rowNum}: ${detail} — Firebase Auth temporarily blocked bulk creates. Wait 15–60 minutes, then import again (existing emails are skipped).`
            : `Row ${rowNum}: ${detail}`,
        );
        break;
      }
    }

    if (!created && summary.errors.length === 0) {
      summary.errors.push(`Row ${rowNum}: could not create user`);
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
    const row = coerceStudentClassRow(rows[i]);
    const rowNum = i + 2;
    const studentId = resolveUserId(
      ctx,
      row,
      rowNum,
      "student",
      ["studentEmail", "student_email", "email", "mail"],
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
    const row = coerceTeacherClassRow(rows[i]);
    const rowNum = i + 2;
    const teacherId = resolveUserId(
      ctx,
      row,
      rowNum,
      "teacher",
      [
        "teacherEmail",
        "teacher_email",
        "teacheremail",
        "email",
        "mail",
        "teacher_mail",
        "teacherMail",
      ],
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
    const row = coerceParentStudentRow(rows[i]);
    const rowNum = i + 2;
    const parentId = resolveUserId(
      ctx,
      row,
      rowNum,
      "parent",
      ["parentEmail", "parent_email", "email", "mail"],
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

async function importSchedule(
  rows: ImportRow[],
  ctx: ImportContext,
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    kind: "schedule",
    created: 0,
    skipped: 0,
    errors: [],
  };

  const sample = rows.slice(0, 8);
  const scheduleLike = sample.filter((row) => rowLooksLikeSchedule(row)).length;
  const classesOnly = sample.filter((row) => {
    const hasName = Boolean(cell(row, "name"));
    return hasName && !rowLooksLikeSchedule(row);
  }).length;
  if (rows.length > 0 && scheduleLike === 0 && classesOnly > 0) {
    summary.errors.push(
      'This sheet looks like Classes (column "name"), not Schedule. Use the "schedule" tab with headers className, dayOfWeek, startTime, endTime, subject — or switch import type to classes.',
    );
    return summary;
  }

  for (let i = 0; i < rows.length; i++) {
    const row = coerceScheduleRow(rows[i]);
    const rowNum = i + 2;
    const classId = resolveClassId(ctx, row, rowNum, summary.errors);
    if (!classId) continue;

    const dayRaw = cell(row, "dayOfWeek", "day_of_week", "day");
    const dayOfWeek = parseDayOfWeek(dayRaw);
    if (!dayOfWeek) {
      summary.errors.push(
        `Row ${rowNum}: invalid dayOfWeek "${dayRaw}" (use monday, tuesday, …)`,
      );
      continue;
    }

    const startRaw = cell(row, "startTime", "start_time", "start");
    const endRaw = cell(row, "endTime", "end_time", "end");
    if (!startRaw || !endRaw) {
      summary.errors.push(`Row ${rowNum}: startTime and endTime required`);
      continue;
    }

    const startTime = normalizeTimeHHmm(startRaw);
    const endTime = normalizeTimeHHmm(endRaw);
    const startMin = parseHHmmToMinutes(startTime);
    const endMin = parseHHmmToMinutes(endTime);
    if (startMin == null || endMin == null) {
      summary.errors.push(`Row ${rowNum}: times must be HH:mm (24-hour)`);
      continue;
    }
    if (endMin <= startMin) {
      summary.errors.push(`Row ${rowNum}: endTime must be after startTime`);
      continue;
    }

    const subject = cell(row, "subject");
    if (!subject) {
      summary.errors.push(`Row ${rowNum}: subject required`);
      continue;
    }

    const teacherName = cell(row, "teacherName", "teacher_name", "teacher");
    const sortOrder = num(row, "sortOrder", "sort_order", "order") ?? 0;

    try {
      await addDoc(collection(db, "classes", classId, "schedules"), {
        classId,
        dayOfWeek,
        startTime,
        endTime,
        subject,
        teacherName,
        sortOrder,
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
  schedule: importSchedule,
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
  schedule:
    "Columns: className, dayOfWeek, startTime, endTime, subject, teacherName (optional), sortOrder (optional)",
  users:
    "Columns: email, password, name, role (student|teacher|parent|admin), phone (optional)",
  student_class: "Columns: studentEmail, className",
  teacher_class: "Columns: teacherEmail, className",
  parent_student: "Columns: parentEmail, studentEmail",
  homework: "Columns: className, subject, title, daysLeft, details (optional)",
  exams: "Columns: className, subject, title, marks, details (optional)",
  remarks: "Columns: className, studentEmail, text, type (optional), rating (optional)",
  announcements: "Columns: className, title, text",
};
