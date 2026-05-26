import { File } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";

/** MIME types + wildcard so .xlsx is selectable on Android, iOS, and Windows. */
export const EXCEL_DOCUMENT_PICKER_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
  "application/octet-stream",
  "text/csv",
  "text/comma-separated-values",
  "*/*",
] as const;

const EXCEL_EXTENSIONS = [".xlsx", ".xls", ".csv", ".xlsm"];

export function isLikelyExcelFilename(name: string | null | undefined): boolean {
  if (!name) return true;
  const lower = name.trim().toLowerCase();
  return EXCEL_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const atobFn =
    typeof globalThis.atob === "function"
      ? globalThis.atob.bind(globalThis)
      : null;
  if (!atobFn) {
    throw new Error("Cannot decode file (base64 not supported on this device)");
  }
  const binary = atobFn(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Read a picked document URI into an ArrayBuffer for SheetJS.
 * Tries the modern File API first, then legacy base64 read (more reliable on some devices).
 */
export async function readExcelArrayBuffer(uri: string): Promise<ArrayBuffer> {
  try {
    const file = new File(uri);
    return await file.arrayBuffer();
  } catch {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64ToArrayBuffer(base64);
  }
}
