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

/**
 * Print or save-as-PDF on web using only the provided HTML.
 * expo-print ignores `html` on web and prints the app shell instead.
 */
export function printHtmlOnWeb(html: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("PRINT_NOT_SUPPORTED"));
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.setAttribute("title", "Print document");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";

    let settled = false;
    const finish = (err?: unknown) => {
      if (settled) return;
      settled = true;
      window.setTimeout(() => iframe.remove(), 300);
      if (err) {
        reject(err instanceof Error ? err : new Error("PRINT_FAILED"));
      } else {
        resolve();
      }
    };

    iframe.onload = () => {
      window.setTimeout(() => {
        try {
          const win = iframe.contentWindow;
          if (!win) {
            finish(new Error("PRINT_IFRAME_UNAVAILABLE"));
            return;
          }

          const onAfterPrint = () => finish();
          win.addEventListener("afterprint", onAfterPrint, { once: true });
          window.setTimeout(onAfterPrint, 60_000);

          win.focus();
          win.print();
        } catch (err) {
          finish(err);
        }
      }, 150);
    };

    iframe.onerror = () => finish(new Error("PRINT_FAILED"));
    document.body.appendChild(iframe);
    iframe.srcdoc = html;
  });
}

/** Read a picked file URI on web (blob:, data:, http(s):). */
export async function readUriAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Failed to read file (${response.status})`);
  }
  return response.arrayBuffer();
}
