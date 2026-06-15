import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import { useAdminData } from "../../src/context/adminDataContext";
import { adminSurfaceCardStyle } from "../../src/constants/platformLayout";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import {
  buildParentOverviewRows,
  loadParentStudentCounts,
  optimisticToggleCurrentMonthFee,
  patchOverviewRowFromFeeMonths,
  type ParentOverviewRow,
} from "../../src/services/adminParentsOverview";
import { setParentFeeMonthPaid } from "../../src/services/parentFeePayments";
import { showErrorAlert } from "../../src/utils/confirmDialog";
import { DirectoryPagination } from "./DirectoryPagination";
import { INNER_CARD_BORDER_GREEN, INNER_CARD_BORDER_RED } from "../../src/constants/innerCardBorders";

type FeeFilter = "all" | "yes" | "no";

export function AdminParentsOverview() {
  const { t } = useTranslation();
  const layout = usePlatformLayout();
  const { parents, usersLoading, loadUsers } = useAdminData();
  const [search, setSearch] = useState("");
  const [feeFilter, setFeeFilter] = useState<FeeFilter>("all");
  const [rows, setRows] = useState<ParentOverviewRow[]>([]);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoadingCounts(true);
    try {
      const counts = await loadParentStudentCounts();
      setRows(buildParentOverviewRows(parents, counts));
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.parentOverviewLoadFailed"),
      );
      setRows(buildParentOverviewRows(parents, new Map()));
    } finally {
      setLoadingCounts(false);
    }
  }, [parents, t]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const feeStats = useMemo(() => {
    const paid = rows.filter((row) => row.feePaid).length;
    return { paid, unpaid: rows.length - paid, total: rows.length };
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (feeFilter === "yes") list = list.filter((row) => row.feePaid);
    if (feeFilter === "no") list = list.filter((row) => !row.feePaid);

    const q = search.trim().toLowerCase();
    if (!q) return list;

    if (q === "yes" || q === "no") {
      const wantPaid = q === "yes";
      return list.filter((row) => row.feePaid === wantPaid);
    }

    return list.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.contact.toLowerCase().includes(q),
    );
  }, [rows, search, feeFilter]);

  const pagination = usePaginatedList(filtered, 6, `${search}-${feeFilter}`);
  const busy = usersLoading || loadingCounts;
  const showTableLayout = layout.isDesktopWeb;
  const year = new Date().getFullYear();

  const openParentDetail = (parentId: string) => {
    router.push({
      pathname: "/(admin)/parent/[parentId]",
      params: { parentId },
    } as never);
  };

  const toggleFee = async (row: ParentOverviewRow) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const nextPaid = !row.feePaid;

    setRows((prev) =>
      prev.map((item) =>
        item.id === row.id ? optimisticToggleCurrentMonthFee(item) : item,
      ),
    );
    setTogglingId(row.id);
    try {
      const feeMonths = await setParentFeeMonthPaid(
        row.id,
        year,
        month,
        nextPaid,
      );
      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? patchOverviewRowFromFeeMonths(item, feeMonths, year)
            : item,
        ),
      );
      void loadUsers();
    } catch (err) {
      setRows((prev) =>
        prev.map((item) => (item.id === row.id ? row : item)),
      );
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.parentFeeUpdateFailed"),
      );
    } finally {
      setTogglingId(null);
    }
  };

  const feeFilters: { key: FeeFilter; label: string }[] = [
    { key: "all", label: t("common.all") },
    { key: "yes", label: t("common.yes") },
    { key: "no", label: t("common.no") },
  ];

  return (
    <View style={[styles.card, adminSurfaceCardStyle(layout), styles.cardSpacing]}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t("admin.parentOverviewTitle")}</Text>
          <Text style={styles.hint}>{t("admin.parentOverviewHint")}</Text>
        </View>
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => router.push("/(admin)/user-directory/parent")}
        >
          <Text style={styles.linkBtnText}>{t("admin.manageParents")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statChip}>
          {t("admin.parentFeePaidCount", { count: feeStats.paid })}
        </Text>
        <Text style={styles.statChipMuted}>
          {t("admin.parentFeeUnpaidCount", { count: feeStats.unpaid })}
        </Text>
        <Text style={styles.statChipMuted}>
          {t("admin.parentFeeTotalCount", { count: feeStats.total })}
        </Text>
      </View>

      <View style={styles.filterRow}>
        {feeFilters.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.filterChip,
              feeFilter === item.key && styles.filterChipActive,
            ]}
            onPress={() => setFeeFilter(item.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                feeFilter === item.key && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.search}
        placeholder={t("admin.parentOverviewSearch")}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />

      {showTableLayout ? (
        <View style={styles.tableHead}>
          <Text style={[styles.th, styles.colName]}>{t("admin.fullNameLabel")}</Text>
          <Text style={[styles.th, styles.colContact]}>
            {t("admin.parentContactColumn")}
          </Text>
          <Text style={[styles.th, styles.colStudents]}>
            {t("admin.parentStudentsColumn")}
          </Text>
          <Text style={[styles.th, styles.colMonths]}>
            {t("admin.parentMonthsColumn", { year })}
          </Text>
          <Text style={[styles.th, styles.colFee]}>{t("admin.parentFeeColumn")}</Text>
        </View>
      ) : null}

      {busy && rows.length === 0 ? (
        <ActivityIndicator style={styles.loader} color="#7C3AED" />
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>{t("admin.parentOverviewEmpty")}</Text>
      ) : (
        <>
          <DirectoryPagination
            rangeStart={pagination.rangeStart}
            rangeEnd={pagination.rangeEnd}
            totalCount={pagination.totalCount}
            page={pagination.page}
            totalPages={pagination.totalPages}
            canPrev={pagination.canPrev}
            canNext={pagination.canNext}
            onPrev={pagination.prevPage}
            onNext={pagination.nextPage}
          />

          {pagination.pageItems.map((row) => (
            <View key={row.id} style={[styles.row, showTableLayout && styles.rowWeb]}>
              <Pressable
                style={[styles.rowMain, !showTableLayout && styles.rowMainMobile]}
                onPress={() => openParentDetail(row.id)}
              >
                <View style={[styles.colName, !showTableLayout && styles.colNameMobile]}>
                  <Text style={styles.name} numberOfLines={1}>
                    {row.name}
                  </Text>
                  {!showTableLayout ? (
                    <Text style={styles.meta} numberOfLines={2}>
                      {row.contact}
                    </Text>
                  ) : null}
                </View>

                {showTableLayout ? (
                  <Text style={[styles.meta, styles.colContact]} numberOfLines={2}>
                    {row.contact}
                  </Text>
                ) : null}

                {showTableLayout ? (
                  <Text style={[styles.students, styles.colStudents]}>
                    {row.linkedStudentCount}
                  </Text>
                ) : null}

                {showTableLayout ? (
                  <Text style={[styles.months, styles.colMonths]}>
                    {row.paidMonthsThisYear}/12
                  </Text>
                ) : null}
              </Pressable>

              {!showTableLayout ? (
                <View style={styles.mobileStatsRow}>
                  <Text style={styles.mobileStat}>
                    {t("admin.parentStudentsColumn")}: {row.linkedStudentCount}
                  </Text>
                  <Text style={styles.mobileStatMonths}>
                    {year}: {row.paidMonthsThisYear}/12
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.feeBtn,
                  row.feePaid ? styles.feeBtnYes : styles.feeBtnNo,
                  showTableLayout && styles.colFee,
                  !showTableLayout && styles.feeBtnMobile,
                ]}
                onPress={() => void toggleFee(row)}
                disabled={togglingId === row.id}
              >
                {togglingId === row.id ? (
                  <ActivityIndicator
                    size="small"
                    color={row.feePaid ? "#065F46" : "#475569"}
                  />
                ) : (
                  <Text
                    style={[
                      styles.feeBtnText,
                      row.feePaid ? styles.feeBtnTextYes : styles.feeBtnTextNo,
                    ]}
                  >
                    {row.feePaid ? t("common.yes") : t("common.no")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
  },
  cardSpacing: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  headerText: { flex: 1, minWidth: 0 },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  linkBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#F5F3FF",
  },
  linkBtnText: {
    color: "#6D28D9",
    fontWeight: "700",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  statChip: {
    fontSize: 13,
    fontWeight: "700",
    color: "#065F46",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statChipMuted: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  filterChipActive: {
    backgroundColor: "#6D28D9",
    borderColor: "#6D28D9",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  filterChipTextActive: { color: "#FFFFFF" },
  search: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginBottom: 4,
  },
  th: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 8,
  },
  rowWeb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  rowMainMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  colNameMobile: {
    flex: undefined,
    width: "100%",
  },
  mobileStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingLeft: 2,
  },
  mobileStat: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  mobileStatMonths: {
    fontSize: 14,
    fontWeight: "800",
    color: "#6D28D9",
  },
  feeBtnMobile: {
    alignSelf: "flex-end",
  },
  colName: { flex: 1.2, minWidth: 0 },
  colContact: { flex: 1.4, minWidth: 0 },
  colStudents: {
    width: 64,
    textAlign: "center",
  },
  colMonths: {
    width: 72,
    textAlign: "center",
  },
  colFee: {
    width: 72,
    alignSelf: "center",
  },
  name: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  meta: { fontSize: 13, color: "#64748B", marginTop: 2, lineHeight: 18 },
  students: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
  },
  months: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6D28D9",
  },
  feeBtn: {
    minWidth: 72,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
  },
  feeBtnYes: { backgroundColor: "#D1FAE5" },
  feeBtnNo: { backgroundColor: "#F1F5F9" },
  feeBtnText: { fontWeight: "800", fontSize: 13 },
  feeBtnTextYes: { color: "#065F46" },
  feeBtnTextNo: { color: "#475569" },
  loader: { marginVertical: 24 },
  empty: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 14,
    paddingVertical: 20,
  },
});
