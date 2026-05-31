import {
  getSubscriptionStatus,
  formatUsageExpiryDate,
} from "../src/utils/subscriptionStatus";

describe("subscriptionStatus", () => {
  it("returns not_set when expiry missing", () => {
    expect(getSubscriptionStatus(null)).toBe("not_set");
    expect(getSubscriptionStatus("")).toBe("not_set");
  });

  it("returns expired when date is in the past", () => {
    expect(getSubscriptionStatus("2020-01-01")).toBe("expired");
  });

  it("returns expiring when within 7 days", () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    const iso = d.toISOString().slice(0, 10);
    expect(getSubscriptionStatus(iso)).toBe("expiring");
  });

  it("returns active when more than 7 days remain", () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const iso = d.toISOString().slice(0, 10);
    expect(getSubscriptionStatus(iso)).toBe("active");
  });

  it("formats YYYY-MM-DD expiry dates", () => {
    expect(formatUsageExpiryDate("2026-12-31")).toMatch(/2026/);
  });
});
