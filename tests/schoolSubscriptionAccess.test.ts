import {
  getSchoolSubscriptionBlockReason,
  isSchoolEntitled,
} from "../src/utils/schoolSubscriptionAccess";

describe("schoolSubscriptionAccess", () => {
  const future = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  };

  const past = () => {
    const d = new Date();
    d.setDate(d.getDate() - 5);
    return d.toISOString().slice(0, 10);
  };

  it("allows active school within testing period", () => {
    expect(
      isSchoolEntitled({ active: true, testingExpiresAt: future() }),
    ).toBe(true);
  });

  it("blocks inactive schools", () => {
    expect(
      getSchoolSubscriptionBlockReason({
        active: false,
        testingExpiresAt: future(),
      }),
    ).toBe("inactive");
  });

  it("uses usage expiry when set", () => {
    expect(
      isSchoolEntitled({
        active: true,
        testingExpiresAt: past(),
        usageExpiresAt: future(),
      }),
    ).toBe(true);
    expect(
      getSchoolSubscriptionBlockReason({
        active: true,
        testingExpiresAt: future(),
        usageExpiresAt: past(),
      }),
    ).toBe("usage_expired");
  });

  it("falls back to testing expiry when usage is unset and grace ended", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-28T12:00:00"));
    expect(
      getSchoolSubscriptionBlockReason({
        active: true,
        testingExpiresAt: "2026-05-10",
        usageExpiresAt: null,
      }),
    ).toBe("testing_expired");
    jest.useRealTimers();
  });

  it("allows activation grace after testing ends without usage", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-28T12:00:00"));
    expect(
      isSchoolEntitled({
        active: true,
        testingExpiresAt: "2026-05-27",
        usageExpiresAt: null,
      }),
    ).toBe(true);
    jest.useRealTimers();
  });
});
