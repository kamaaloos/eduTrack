import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  type User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { isBlockedPassword } from "../utils/mustChangePassword";

function requireUser(): User {
  const user = auth.currentUser;
  if (!user?.email) {
    throw new Error("You must be signed in with an email account.");
  }
  return user;
}

async function reauthenticate(currentPassword: string): Promise<User> {
  const user = requireUser();
  const credential = EmailAuthProvider.credential(
    user.email!,
    currentPassword,
  );
  await reauthenticateWithCredential(user, credential);
  return user;
}

export function mapAuthError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;
  const code = err.message;
  if (code.includes("wrong-password") || code.includes("invalid-credential")) {
    return "Current password is incorrect.";
  }
  if (code.includes("email-already-in-use")) {
    return "That email is already used by another account.";
  }
  if (code.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (code.includes("requires-recent-login")) {
    return "Please sign out and sign in again, then retry.";
  }
  if (code.includes("weak-password")) {
    return "New password must be at least 6 characters.";
  }
  return err.message || fallback;
}

export async function updateProfileName(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name is required");
  const user = requireUser();
  await setDoc(doc(db, "users", user.uid), { name: trimmed }, { merge: true });
}

export async function changeUserEmail(
  newEmail: string,
  currentPassword: string,
): Promise<void> {
  const trimmed = newEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error("Please enter a valid email address.");
  }
  await reauthenticate(currentPassword);
  const user = auth.currentUser!;
  await updateEmail(user, trimmed);
  await user.reload();
  await setDoc(doc(db, "users", user.uid), { email: trimmed }, { merge: true });
}

export async function changeUserPassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters.");
  }
  if (newPassword === currentPassword) {
    throw new Error("Choose a password different from your current one.");
  }
  await reauthenticate(currentPassword);
  await updatePassword(auth.currentUser!, newPassword);
}

/**
 * Required after admin-created accounts: set a new password and clear the flag.
 */
export async function completeRequiredPasswordChange(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters.");
  }
  if (newPassword === currentPassword) {
    throw new Error("Choose a password different from your temporary one.");
  }
  if (isBlockedPassword(newPassword)) {
    throw new Error("Choose a stronger password than the default temporary one.");
  }

  await reauthenticate(currentPassword);
  const user = auth.currentUser!;
  await updatePassword(user, newPassword);

  await setDoc(
    doc(db, "users", user.uid),
    {
      mustChangePassword: false,
      passwordChangedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
