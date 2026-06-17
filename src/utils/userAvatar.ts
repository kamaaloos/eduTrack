export function parsePhotoURL(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function canUploadProfilePhoto(role: string | null | undefined): boolean {
  return role === "student" || role === "teacher";
}
