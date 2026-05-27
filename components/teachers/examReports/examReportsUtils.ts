export function scoreLabel(
  score: number | null,
  maxMarks: number | null,
): string {
  if (score == null) return "—";
  if (maxMarks != null) return `${score}/${maxMarks}`;
  return `${score}%`;
}
