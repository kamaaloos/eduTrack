import { test, expect } from "@playwright/test";
import {
  hasRoleLoginEnv,
  hasSchoolPickerEnv,
  signInToRoleDashboard,
} from "../helpers/auth";

test.describe("public web smoke", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/landing");
    await expect(page.getByRole("button", { name: /get started/i })).toBeVisible();
  });
});

const roleDashboardMarkers = {
  admin: /admin dashboard/i,
  teacher: /attendance/i,
  student: /schedule this week/i,
  parent: /select a child to view their progress/i,
} as const;

for (const role of ["admin", "teacher", "student", "parent"] as const) {
  test.describe(`${role} login → dashboard`, () => {
    test.skip(
      !hasRoleLoginEnv(role) || !hasSchoolPickerEnv(),
      "Set E2E_SCHOOL_* and E2E_<ROLE>_EMAIL/PASSWORD (see .env.e2e.example)",
    );

    test(`signs in and opens ${role} dashboard`, async ({ page }) => {
      await signInToRoleDashboard(page, role);
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.getByText(roleDashboardMarkers[role]).first()).toBeVisible();
    });
  });
}
