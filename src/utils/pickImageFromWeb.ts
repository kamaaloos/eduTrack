/** Minimal DOM types for CI (no `lib: dom`). */
type WebFileInput = {
  type: string;
  accept: string;
  style: { display: string };
  files: { readonly length: number; [index: number]: Blob } | null;
  addEventListener(type: string, listener: () => void): void;
  remove(): void;
  click(): void;
};

type WebDocument = {
  createElement(tag: string): WebFileInput;
  body: { appendChild(node: WebFileInput): void };
};

function getWebDocument(): WebDocument | null {
  const doc = (globalThis as { document?: WebDocument }).document;
  return doc ?? null;
}

/**
 * Browser file picker for images. Returns a blob: URL (revoke after upload if needed).
 */
export function pickImageFromWeb(accept = "image/*"): Promise<string | null> {
  const document = getWebDocument();
  if (!document) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.style.display = "none";

    const cleanup = () => {
      input.remove();
    };

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      cleanup();
      if (!file) {
        resolve(null);
        return;
      }
      resolve(URL.createObjectURL(file));
    });

    input.addEventListener("cancel", () => {
      cleanup();
      resolve(null);
    });

    document.body.appendChild(input);
    input.click();
  });
}
