/** Browser download for base64-encoded files (Excel templates, etc.). */
export function downloadBase64AsFile(
  base64: string,
  filename: string,
  mimeType: string,
): void {
  if (typeof document === "undefined") {
    throw new Error("File download is not supported on this platform");
  }

  const atobFn =
    typeof globalThis.atob === "function"
      ? globalThis.atob.bind(globalThis)
      : null;
  if (!atobFn) {
    throw new Error("Cannot decode file (base64 not supported)");
  }

  const binary = atobFn(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Download a PDF (or other blob) produced by expo-print on web. */
export async function downloadBlobFromUri(uri: string, filename: string): Promise<void> {
  if (typeof document === "undefined") {
    throw new Error("File download is not supported on this platform");
  }

  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Failed to read file (${response.status})`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Read a picked file URI on web (blob:, data:, http(s):). */
export async function readUriAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Failed to read file (${response.status})`);
  }
  return response.arrayBuffer();
}
