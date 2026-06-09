import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { downloadBlobFromUri } from "../utils/webFileDownload";

function safePdfFileName(fileName: string): string {
  const safeName = fileName.replace(/[^\w.-]+/g, "_");
  return safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`;
}

export async function shareHtmlAsPdf(
  html: string,
  fileName: string,
  dialogTitle: string,
): Promise<void> {
  const pdfName = safePdfFileName(fileName);
  const { uri } = await Print.printToFileAsync({ html });

  if (Platform.OS === "web") {
    await downloadBlobFromUri(uri, pdfName);
    return;
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("PDF_SHARING_UNAVAILABLE");
  }

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new Error("PDF_CACHE_UNAVAILABLE");
  }

  const dest = `${cacheDir}${pdfName}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  await Sharing.shareAsync(dest, {
    mimeType: "application/pdf",
    dialogTitle,
    UTI: "com.adobe.pdf",
  });
}
