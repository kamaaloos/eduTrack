import * as ImagePicker from "expo-image-picker";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { readImageBytes } from "../utils/readImageBytes";
import { auth, db, storage } from "./firebase";

const MAX_BYTES = 5 * 1024 * 1024;
const STORAGE_PATH = (uid: string) => `profilePhotos/${uid}/profile.jpg`;

function requireSchoolSession() {
  const user = auth?.currentUser;
  if (!user || !db || !storage) {
    throw new Error("STORAGE_NOT_READY");
  }
  return user;
}

function firebaseErrorCode(err: unknown): string | null {
  if (err && typeof err === "object" && "code" in err) {
    return String((err as { code: string }).code);
  }
  return null;
}

/** User-facing message for profile photo failures (pass to i18n keys in UI). */
export function getProfilePhotoErrorKey(err: unknown): string {
  if (err instanceof Error) {
    switch (err.message) {
      case "PHOTO_PERMISSION_DENIED":
        return "profile.photoPermissionDenied";
      case "PHOTO_TOO_LARGE":
        return "profile.photoTooLarge";
      case "STORAGE_NOT_READY":
        return "profile.photoStorageNotReady";
      case "IMAGE_READ_FAILED":
        return "profile.photoReadFailed";
    }
  }

  const code = firebaseErrorCode(err);
  switch (code) {
    case "storage/unauthorized":
    case "storage/unauthenticated":
      return "profile.photoStorageRules";
    case "permission-denied":
      return "profile.photoFirestoreRules";
    case "storage/unknown":
    case "storage/retry-limit-exceeded":
      return "profile.photoStorageUnavailable";
    default:
      return "profile.photoUploadFailed";
  }
}

export async function pickProfileImageUri(): Promise<string | null> {
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

export async function uploadProfilePhoto(localUri: string): Promise<string> {
  const user = requireSchoolSession();

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

  const storageRef = ref(storage!, STORAGE_PATH(user.uid));
  await uploadBytes(storageRef, bytes, { contentType });
  const downloadUrl = await getDownloadURL(storageRef);

  await setDoc(
    doc(db!, "users", user.uid),
    { photoURL: downloadUrl },
    { merge: true },
  );

  return downloadUrl;
}

export async function removeProfilePhoto(): Promise<void> {
  const user = requireSchoolSession();
  try {
    await deleteObject(ref(storage!, STORAGE_PATH(user.uid)));
  } catch {
    // File may not exist yet.
  }
  await setDoc(doc(db!, "users", user.uid), { photoURL: null }, { merge: true });
}
