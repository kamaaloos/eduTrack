export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function validateScore(score: string): boolean {
  const trimmed = score.trim();
  if (!trimmed) return false;
  const num = Number(trimmed);
  return !Number.isNaN(num) && num >= 0 && num <= 100;
}

export function validateClassName(name: string): boolean {
  return name.trim().length > 0;
}

export function validateUsageExpiryDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date.trim());
}
