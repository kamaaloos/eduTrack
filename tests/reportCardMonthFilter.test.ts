import {
  buildMonthOptions,
  monthKeyFromDateKey,
  pickDefaultMonthKey,
} from "../src/utils/reportCardMonthFilter";

describe("reportCardMonthFilter", () => {
  it("builds sorted month options", () => {
    const options = buildMonthOptions(["2026-05", "2026-06"], "en-US");
    expect(options).toHaveLength(2);
    expect(options[0].value).toBe("2026-06");
    expect(options[0].label).toContain("2026");
  });

  it("picks current month when available", () => {
    const now = new Date().toISOString().slice(0, 7);
    expect(pickDefaultMonthKey([now, "2020-01"])).toBe(now);
  });

  it("derives month key from date key", () => {
    expect(monthKeyFromDateKey("2026-06-17")).toBe("2026-06");
  });
});
