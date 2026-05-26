/** Stable Firestore doc key segment for a subject name. */
export function normalizeSubjectKey(subject: string): string {
  const trimmed = subject.trim();
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (slug) return slug;

  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash * 31 + trimmed.charCodeAt(i)) | 0;
  }
  return `sub_${Math.abs(hash)}`;
}

export function subjectsMatch(a: string, b: string): boolean {
  return normalizeSubjectKey(a) === normalizeSubjectKey(b);
}
