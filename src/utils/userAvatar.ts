/** Build 1–2 letter initials from a display name or email. */
export function getInitials(
  name?: string | null,
  email?: string | null,
): string {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return trimmed.charAt(0).toUpperCase();
  }
  const mail = email?.trim();
  if (mail) return mail.charAt(0).toUpperCase();
  return "?";
}

export function canUploadProfilePhoto(role: string | null | undefined): boolean {
  return role === "student" || role === "teacher";
}
