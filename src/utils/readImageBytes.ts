import { File } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";

function base64ToUint8Array(base64: string): Uint8Array {
  const atobFn =
    typeof globalThis.atob === "function"
      ? globalThis.atob.bind(globalThis)
      : null;
  if (!atobFn) {
    throw new Error("Cannot decode image (base64 not supported on this device)");
  }
  const binary = atobFn(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function guessImageContentType(uri: string): string {
  const lower = uri.split("?")[0].toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".heic") || lower.endsWith(".heif")) return "image/jpeg";
  return "image/jpeg";
}

/** Read a local image URI into bytes (reliable on React Native). */
export async function readImageBytes(
  uri: string,
): Promise<{ bytes: Uint8Array; contentType: string }> {
  const contentType = guessImageContentType(uri);

  try {
    const file = new File(uri);
    const buffer = await file.arrayBuffer();
    return { bytes: new Uint8Array(buffer), contentType };
  } catch {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return { bytes: base64ToUint8Array(base64), contentType };
  }
}
