import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

const ONBOARDING_KEY = "@edutrack/onboarding_complete";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Country/city rows in select-school show labels like "Finland (2)". */
function pickerOptionLocator(page: Page, label: string) {
  const trimmed = label.trim();
  return page.getByText(
    new RegExp(`^${escapeRegExp(trimmed)}\\s*\\(\\d+\\)$`),
  );
}

export function hasRoleLoginEnv(role: "admin" | "teacher" | "student" | "parent"): boolean {
  const prefix = `E2E_${role.toUpperCase()}`;
  return Boolean(process.env[`${prefix}_EMAIL`] && process.env[`${prefix}_PASSWORD`]);
}

export function hasSchoolPickerEnv(): boolean {
  return Boolean(
    process.env.E2E_SCHOOL_COUNTRY &&
      process.env.E2E_SCHOOL_CITY &&
      process.env.E2E_SCHOOL_NAME,
  );
}

export async function markOnboardingComplete(page: Page): Promise<void> {
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, "true");
  }, ONBOARDING_KEY);
}

export async function selectSchoolIfNeeded(page: Page): Promise<void> {
  if (!hasSchoolPickerEnv()) {
    throw new Error("E2E_SCHOOL_COUNTRY, E2E_SCHOOL_CITY, and E2E_SCHOOL_NAME are required");
  }

  const country = process.env.E2E_SCHOOL_COUNTRY!.trim();
  const city = process.env.E2E_SCHOOL_CITY!.trim();
  const school = process.env.E2E_SCHOOL_NAME!.trim();

  await page.goto("/select-school");
  await expect(page.getByText(/select country/i)).toBeVisible({ timeout: 30_000 });

  await pickerOptionLocator(page, country).click();
  await pickerOptionLocator(page, city).click();
  await page.getByText(school, { exact: true }).click();
  await page.waitForURL(/\/login/, { timeout: 30_000 });
}

export async function loginAs(
  page: Page,
  role: "admin" | "teacher" | "student" | "parent",
): Promise<void> {
  const email = process.env[`E2E_${role.toUpperCase()}_EMAIL`];
  const password = process.env[`E2E_${role.toUpperCase()}_PASSWORD`];
  if (!email || !password) {
    throw new Error(`Missing E2E_${role.toUpperCase()}_EMAIL or _PASSWORD`);
  }

  if (!page.url().includes("/login")) {
    await page.goto("/login");
  }

  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
}

export async function signInToRoleDashboard(
  page: Page,
  role: "admin" | "teacher" | "student" | "parent",
): Promise<void> {
  await markOnboardingComplete(page);
  await selectSchoolIfNeeded(page);
  await loginAs(page, role);
  await page.waitForURL(/\/dashboard/, { timeout: 45_000 });
}
