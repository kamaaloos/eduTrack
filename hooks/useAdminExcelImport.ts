import * as DocumentPicker from "expo-document-picker";
import { useCallback, useState } from "react";
import {
  formatWorkbookPickHint,
  getImportableRowCount,
  ImportKind,
  ImportSummary,
  ParsedWorkbook,
  parseWorkbookFromArrayBuffer,
  runImportKind,
  runWorkbookImport,
} from "../src/services/adminExcelImport";
import { shareImportTemplate } from "../src/services/adminExcelImportTemplate";
import {
  EXCEL_DOCUMENT_PICKER_TYPES,
  isLikelyExcelFilename,
  readExcelArrayBuffer,
} from "../src/utils/readExcelFile";

export type ImportMode = "sheet" | "workbook";

export const useAdminExcelImport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedWorkbook | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importableRowCount, setImportableRowCount] = useState(0);

  const pickExcelFile = useCallback(
    async (
      mode: ImportMode = "workbook",
      singleSheetKind?: ImportKind,
    ): Promise<ParsedWorkbook | null> => {
      setError(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: [...EXCEL_DOCUMENT_PICKER_TYPES],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return null;
      }

      const asset = result.assets[0];
      const pickedName = asset.name ?? "import.xlsx";

      if (!isLikelyExcelFilename(pickedName)) {
        setError(
          `“${pickedName}” may not be Excel. Use .xlsx from the template (not .numbers or Google Sheets link).`,
        );
      }

      setLoading(true);

      try {
        const buffer = await readExcelArrayBuffer(asset.uri);
        if (!buffer.byteLength) {
          throw new Error("File is empty");
        }

        const workbook = parseWorkbookFromArrayBuffer(
          buffer,
          mode === "sheet" ? singleSheetKind : undefined,
        );

        const rowCount = getImportableRowCount(workbook);
        setImportableRowCount(rowCount);
        setParsed(workbook);
        setFileName(pickedName);

        if (mode === "workbook") {
          const hint = formatWorkbookPickHint(workbook);
          if (hint) setError(hint);
        } else if (singleSheetKind) {
          const rows = workbook.sheets[singleSheetKind]?.length ?? 0;
          if (rows === 0) {
            setError(
              `No data rows on the first sheet. Add headers + data, or use Full workbook mode with a sheet named “${singleSheetKind}”.`,
            );
          }
        }

        return workbook;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to read Excel file";
        setError(message);
        setParsed(null);
        setFileName(null);
        setImportableRowCount(0);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const importSheet = useCallback(
    async (kind: ImportKind): Promise<ImportSummary> => {
      if (!parsed) {
        throw new Error("Pick an Excel file first");
      }

      const rows = parsed.sheets[kind];
      if (!rows?.length) {
        throw new Error(
          `No rows found for sheet "${kind}". Name the sheet "${kind}" or use Full workbook mode.`,
        );
      }

      setLoading(true);
      setError(null);

      try {
        return await runImportKind(kind, rows);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Import failed";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [parsed],
  );

  const importWorkbook = useCallback(async (): Promise<ImportSummary[]> => {
    if (!parsed) {
      throw new Error("Pick an Excel file first");
    }

    if (importableRowCount === 0) {
      throw new Error(
        formatWorkbookPickHint(parsed) ??
          "No recognized sheets found. Use sheet names: classes, users, student_class, homework, etc.",
      );
    }

    setLoading(true);
    setError(null);

    try {
      return await runWorkbookImport(parsed);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Workbook import failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [parsed, importableRowCount]);

  const clearFile = useCallback(() => {
    setParsed(null);
    setFileName(null);
    setError(null);
    setImportableRowCount(0);
  }, []);

  const downloadTemplate = useCallback(
    async (mode: ImportMode, singleSheetKind?: ImportKind) => {
      setLoading(true);
      setError(null);
      try {
        const kinds =
          mode === "sheet" && singleSheetKind
            ? [singleSheetKind]
            : undefined;
        await shareImportTemplate(kinds);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not share template";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    parsed,
    fileName,
    importableRowCount,
    canImport: parsed !== null && importableRowCount > 0,
    pickExcelFile,
    importSheet,
    importWorkbook,
    downloadTemplate,
    clearFile,
  };
};
