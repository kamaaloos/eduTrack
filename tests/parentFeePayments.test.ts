import {
  applyMonthToFeeMap,
  countPaidMonthsInYear,
  effectiveFeeMonthsForYear,
  feeMonthKey,
  feeStatusFromMonths,
  parseFeeMonths,
} from "../src/services/parentFeePayments";
import {
  optimisticToggleCurrentMonthFee,
  patchOverviewRowFromFeeMonths,
} from "../src/services/adminParentsOverview";

describe("effectiveFeeMonthsForYear", () => {
  it("adds current month when feePaid is true and map is empty", () => {
    const ref = new Date(2026, 5, 15); // June 2026
    const merged = effectiveFeeMonthsForYear({}, 2026, true, ref);
    expect(merged[feeMonthKey(2026, 6)]).toBe(true);
    expect(countPaidMonthsInYear(merged, 2026)).toBe(1);
  });

  it("does not add month for a different year", () => {
    const ref = new Date(2026, 5, 15);
    const merged = effectiveFeeMonthsForYear({}, 2025, true, ref);
    expect(countPaidMonthsInYear(merged, 2025)).toBe(0);
  });

  it("keeps existing feeMonths entries", () => {
    const map = { [feeMonthKey(2026, 3)]: true };
    const merged = effectiveFeeMonthsForYear(map, 2026, true, new Date(2026, 5, 1));
    expect(countPaidMonthsInYear(merged, 2026)).toBe(2);
  });
});

describe("parseFeeMonths", () => {
  it("ignores non-true values", () => {
    expect(parseFeeMonths({ "2026-01": true, "2026-02": false })).toEqual({
      "2026-01": true,
    });
  });
});

describe("applyMonthToFeeMap", () => {
  it("removes month when unpaid", () => {
    const map = { [feeMonthKey(2026, 6)]: true };
    const next = applyMonthToFeeMap(map, 2026, 6, false);
    expect(next[feeMonthKey(2026, 6)]).toBeUndefined();
    expect(feeStatusFromMonths(next, 2026, new Date(2026, 5, 1)).paidMonthsThisYear).toBe(0);
  });
});

describe("overview fee patch", () => {
  const baseRow = {
    id: "p1",
    name: "Test",
    contact: "—",
    linkedStudentCount: 1,
    feePaid: false,
    paidMonthsThisYear: 0,
  };

  it("optimistic toggle increases then patch from map", () => {
    const optimistic = optimisticToggleCurrentMonthFee(baseRow);
    expect(optimistic.feePaid).toBe(true);
    expect(optimistic.paidMonthsThisYear).toBe(1);

    const map = { [feeMonthKey(2026, 6)]: true };
    const patched = patchOverviewRowFromFeeMonths(
      baseRow,
      map,
      2026,
    );
    expect(patched.paidMonthsThisYear).toBe(1);
    expect(patched.feePaid).toBe(true);
  });
});
