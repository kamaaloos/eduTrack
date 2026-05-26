/** Firestore user profile flag: user must set a new password before using the app. */
export const USER_MUST_CHANGE_PASSWORD_FIELD = "mustChangePassword";

export function userMustChangePassword(
  userData: { mustChangePassword?: boolean } | null | undefined,
): boolean {
  return userData?.mustChangePassword === true;
}

/** Block obvious temporary passwords when completing the required change. */
export const BLOCKED_PASSWORDS = new Set(["123456", "password", "12345678"]);

export function isBlockedPassword(password: string): boolean {
  return BLOCKED_PASSWORDS.has(password.trim().toLowerCase());
}
