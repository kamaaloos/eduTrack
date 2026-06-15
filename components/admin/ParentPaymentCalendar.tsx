import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import {
  countPaidMonthsInYear,
  feeMonthKey,
  type FeeMonthsMap,
} from "../../src/services/parentFeePayments";

const MONTH_KEYS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

type ParentPaymentCalendarProps = {
  year: number;
  feeMonths: FeeMonthsMap;
  onToggleMonth: (month: number, paid: boolean) => void;
  disabled?: boolean;
};

export function ParentPaymentCalendar({
  year,
  feeMonths,
  onToggleMonth,
  disabled,
}: ParentPaymentCalendarProps) {
  const { t } = useTranslation();
  const paidCount = useMemo(
    () => countPaidMonthsInYear(feeMonths, year),
    [feeMonths, year],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.summary}>
        {t("admin.parentPaymentYearSummary", { paid: paidCount, year })}
      </Text>
      <View style={styles.grid}>
        {MONTH_KEYS.map((labelKey, index) => {
          const month = index + 1;
          const paid = feeMonths[feeMonthKey(year, month)] === true;
          return (
            <TouchableOpacity
              key={labelKey}
              style={[styles.monthCell, paid && styles.monthCellPaid]}
              onPress={() => onToggleMonth(month, !paid)}
              disabled={disabled}
            >
              <Text style={[styles.monthLabel, paid && styles.monthLabelPaid]}>
                {t(`admin.monthShort.${labelKey}`)}
              </Text>
              <Text style={[styles.monthStatus, paid && styles.monthStatusPaid]}>
                {paid ? t("common.yes") : t("common.no")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.hint}>{t("admin.parentPaymentCalendarHint")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  summary: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  monthCell: {
    width: "30%",
    minWidth: 96,
    flexGrow: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  monthCellPaid: {
    backgroundColor: "#D1FAE5",
    borderColor: "#34D399",
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  monthLabelPaid: { color: "#065F46" },
  monthStatus: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "800",
    color: "#475569",
  },
  monthStatusPaid: { color: "#047857" },
  hint: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
});
