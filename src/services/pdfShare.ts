import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export async function shareHtmlAsPdf(
  html: string,
  fileName: string,
  dialogTitle: string,
): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("PDF_SHARING_UNAVAILABLE");
  }

  const { uri } = await Print.printToFileAsync({ html });
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new Error("PDF_CACHE_UNAVAILABLE");
  }

  const safeName = fileName.replace(/[^\w.-]+/g, "_");
  const dest = `${cacheDir}${safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`}`;

  await FileSystem.copyAsync({ from: uri, to: dest });
  await Sharing.shareAsync(dest, {
    mimeType: "application/pdf",
    dialogTitle,
    UTI: "com.adobe.pdf",
  });
}
