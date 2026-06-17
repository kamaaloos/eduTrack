import {
  isTestingPeriodActive,
  resolveAdminDashboardPeriodNotice,
} from "../src/utils/adminDashboardPeriodNotice";

describe("adminDashboardPeriodNotice", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-28T12:00:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows active testing and hides registered usage", () => {
    expect(
      resolveAdminDashboardPeriodNotice({
        testingExpiresAt: "2026-06-10",
        usageExpiresAt: "2026-12-31",
      }),
    ).toEqual({ kind: "testing", remainingDays: 13 });
  });

  it("shows registered usage after testing ends", () => {
    expect(
      resolveAdminDashboardPeriodNotice({
        testingExpiresAt: "2026-05-20",
        usageExpiresAt: "2026-12-31",
      }),
    ).toEqual({ kind: "usage", remainingDays: 217 });
  });

  it("shows activation grace when testing ended without registered usage", () => {
    expect(
      resolveAdminDashboardPeriodNotice({
        testingExpiresAt: "2026-05-27",
        usageExpiresAt: null,
      }),
    ).toEqual({ kind: "activation_grace", remainingDays: 6 });
  });

  it("shows expired activation grace as negative remaining days", () => {
    expect(
      resolveAdminDashboardPeriodNotice({
        testingExpiresAt: "2026-05-10",
        usageExpiresAt: null,
      }),
    ).toEqual({ kind: "activation_grace", remainingDays: -11 });
  });

  it("shows registered usage when only usage is configured", () => {
    expect(
      resolveAdminDashboardPeriodNotice({
        testingExpiresAt: null,
        usageExpiresAt: "2026-12-31",
      }),
    ).toEqual({ kind: "usage", remainingDays: 217 });
  });

  it("detects active testing period", () => {
    expect(
      isTestingPeriodActive({
        testingExpiresAt: "2026-05-28",
        usageExpiresAt: "2026-12-31",
      }),
    ).toBe(true);
    expect(
      isTestingPeriodActive({
        testingExpiresAt: "2026-05-27",
        usageExpiresAt: "2026-12-31",
      }),
    ).toBe(false);
  });
});
