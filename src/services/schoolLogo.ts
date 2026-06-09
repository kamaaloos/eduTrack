import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { readImageBytes } from "../utils/readImageBytes";
import { registryAuth, registryStorage } from "./firebase";

const MAX_BYTES = 5 * 1024 * 1024;

function requireRegistryUploadSession() {
  if (!registryAuth?.currentUser || !registryStorage) {
    throw new Error("REGISTRY_STORAGE_NOT_READY");
  }
}

function firebaseErrorCode(err: unknown): string | null {
  if (err && typeof err === "object" && "code" in err) {
    return String((err as { code: string }).code);
  }
  return null;
}

export function getSchoolLogoErrorKey(err: unknown): string {
  if (err instanceof Error) {
    switch (err.message) {
      case "PHOTO_PERMISSION_DENIED":
        return "superAdmin.logoPermissionDenied";
      case "PHOTO_TOO_LARGE":
        return "superAdmin.logoTooLarge";
      case "REGISTRY_STORAGE_NOT_READY":
        return "superAdmin.logoStorageNotReady";
      case "IMAGE_READ_FAILED":
        return "superAdmin.logoReadFailed";
    }
  }

  const code = firebaseErrorCode(err);
  switch (code) {
    case "storage/unauthorized":
    case "storage/unauthenticated":
      return "superAdmin.logoStorageRules";
    case "storage/unknown":
    case "storage/retry-limit-exceeded":
      return "superAdmin.logoStorageUnavailable";
    default:
      return "superAdmin.logoUploadFailed";
  }
}

function logoObjectName(contentType: string): string {
  if (contentType === "image/png") return "logo.png";
  if (contentType === "image/webp") return "logo.webp";
  return "logo.jpg";
}

export function schoolLogoStoragePath(
  schoolId: string,
  contentType: string,
): string {
  return `schoolLogos/${schoolId}/${logoObjectName(contentType)}`;
}

export async function pickSchoolLogoUri(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("PHOTO_PERMISSION_DENIED");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }
  return result.assets[0].uri;
}

export async function uploadSchoolLogo(
  localUri: string,
  schoolId: string,
): Promise<string> {
  requireRegistryUploadSession();

  let bytes: Uint8Array;
  let contentType: string;
  try {
    const read = await readImageBytes(localUri);
    bytes = read.bytes;
    contentType = read.contentType;
  } catch {
    throw new Error("IMAGE_READ_FAILED");
  }

  if (bytes.byteLength > MAX_BYTES) {
    throw new Error("PHOTO_TOO_LARGE");
  }

  const storageRef = ref(
    registryStorage!,
    schoolLogoStoragePath(schoolId, contentType),
  );
  await uploadBytes(storageRef, bytes, { contentType });
  return getDownloadURL(storageRef);
}
