import { getUsageRemainingDays } from "../src/utils/usageExpiry";

describe("getUsageRemainingDays", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-28T12:00:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns null for empty input", () => {
    expect(getUsageRemainingDays(null)).toBeNull();
    expect(getUsageRemainingDays(undefined)).toBeNull();
    expect(getUsageRemainingDays("")).toBeNull();
    expect(getUsageRemainingDays("   ")).toBeNull();
  });

  it("counts days until YYYY-MM-DD expiry (inclusive of expiry day)", () => {
    expect(getUsageRemainingDays("2026-05-30")).toBe(2);
    expect(getUsageRemainingDays("2026-05-28")).toBe(0);
    expect(getUsageRemainingDays("2026-05-27")).toBe(-1);
  });

  it("returns null for invalid dates", () => {
    expect(getUsageRemainingDays("not-a-date")).toBeNull();
  });
});
