import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AdminScreenShell } from "../../../components/admin/AdminScreenShell";
import { ParentPaymentCalendar } from "../../../components/admin/ParentPaymentCalendar";
import { useAdminData } from "../../../src/context/adminDataContext";
import {
  applyMonthToFeeMap,
  countPaidMonthsInYear,
  effectiveFeeMonthsForYear,
  loadParentFeeMonths,
  setParentFeeMonthPaid,
  type FeeMonthsMap,
} from "../../../src/services/parentFeePayments";
import { showErrorAlert } from "../../../src/utils/confirmDialog";
import { INNER_CARD_BORDER_GREEN } from "../../../src/constants/innerCardBorders";

export default function AdminParentPaymentScreen() {
  const { t } = useTranslation();
  const { parentId: parentIdParam } = useLocalSearchParams<{ parentId: string }>();
  const parentId = String(parentIdParam ?? "");
  const { parents, loadUsers } = useAdminData();

  const parent = useMemo(
    () => parents.find((item) => item.id === parentId),
    [parents, parentId],
  );

  const [year, setYear] = useState(() => new Date().getFullYear());
  const [feeMonths, setFeeMonths] = useState<FeeMonthsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadMonths = useCallback(async () => {
    if (!parentId) return;
    setLoading(true);
    try {
      const map = await loadParentFeeMonths(parentId);
      const legacyFeePaid = parents.find((item) => item.id === parentId)?.feePaid;
      const merged =
        countPaidMonthsInYear(map, year) === 0 && legacyFeePaid === true
          ? effectiveFeeMonthsForYear(map, year, true)
          : map;
      setFeeMonths(merged);
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.parentPaymentLoadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [parentId, year, t, parents]);

  useEffect(() => {
    void loadMonths();
  }, [loadMonths]);

  const handleToggleMonth = async (month: number, paid: boolean) => {
    if (!parentId) return;
    const previous = feeMonths;
    setFeeMonths((current) => applyMonthToFeeMap(current, year, month, paid));
    setSaving(true);
    try {
      const next = await setParentFeeMonthPaid(parentId, year, month, paid);
      setFeeMonths(next);
      void loadUsers();
    } catch (err) {
      setFeeMonths(previous);
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.parentFeeUpdateFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  const contact =
    [parent?.email, typeof parent?.phone === "string" ? parent.phone : ""]
      .filter(Boolean)
      .join(" · ") || "—";

  return (
    <AdminScreenShell
      title={parent?.name || t("admin.parentPaymentTitle")}
      subtitle={t("admin.parentPaymentSubtitle")}
      showBack
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.label}>{t("admin.parentContactColumn")}</Text>
          <Text style={styles.value}>{contact}</Text>

          <View style={styles.yearRow}>
            <TouchableOpacity
              style={styles.yearBtn}
              onPress={() => setYear((y) => y - 1)}
            >
              <Text style={styles.yearBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.yearText}>{year}</Text>
            <TouchableOpacity
              style={styles.yearBtn}
              onPress={() => setYear((y) => y + 1)}
            >
              <Text style={styles.yearBtnText}>›</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#7C3AED" style={styles.loader} />
          ) : (
            <ParentPaymentCalendar
              year={year}
              feeMonths={feeMonths}
              onToggleMonth={(month, paid) => void handleToggleMonth(month, paid)}
              disabled={saving}
            />
          )}
        </View>
      </ScrollView>
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: { fontSize: 15, color: "#0F172A", marginBottom: 16 },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  yearBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  yearBtnText: { fontSize: 22, fontWeight: "700", color: "#334155" },
  yearText: { fontSize: 22, fontWeight: "800", color: "#0F172A", minWidth: 72, textAlign: "center" },
  loader: { marginVertical: 24 },
});
