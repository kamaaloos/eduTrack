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

  it("falls back to testing expiry when usage is unset", () => {
    expect(
      getSchoolSubscriptionBlockReason({
        active: true,
        testingExpiresAt: past(),
        usageExpiresAt: null,
      }),
    ).toBe("testing_expired");
  });
});
