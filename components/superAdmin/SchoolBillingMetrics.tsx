import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import type { SchoolRecord } from "../../src/types/school";
import {
  formatUsageExpiryDate,
  getSubscriptionStatus,
  type SubscriptionStatus,
} from "../../src/utils/subscriptionStatus";
import { getUsageRemainingDays } from "../../src/utils/usageExpiry";

type SchoolBillingMetricsProps = {
  school: SchoolRecord;
  compact?: boolean;
};

function statusLabelKey(status: SubscriptionStatus): string {
  switch (status) {
    case "active":
      return "superAdmin.subscriptionActive";
    case "expiring":
      return "superAdmin.subscriptionExpiring";
    case "expired":
      return "superAdmin.subscriptionExpired";
    default:
      return "superAdmin.subscriptionNotSet";
  }
}

function statusColor(status: SubscriptionStatus): string {
  switch (status) {
    case "active":
      return "#15803D";
    case "expiring":
      return "#B45309";
    case "expired":
      return "#B91C1C";
    default:
      return "#64748B";
  }
}

function formatLastSynced(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function SchoolBillingMetrics({
  school,
  compact = false,
}: SchoolBillingMetricsProps) {
  const { t } = useTranslation();
  const subscriptionStatus = getSubscriptionStatus(school.usageExpiresAt);
  const expiryLabel = formatUsageExpiryDate(school.usageExpiresAt);
  const daysLeft = getUsageRemainingDays(school.usageExpiresAt);
  const lastSynced = formatLastSynced(school.userCountUpdatedAt);

  const userCountLabel =
    school.userCount != null
      ? String(school.userCount)
      : school.userCountSyncError
        ? "—"
        : t("superAdmin.userCountPending");

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.metricRow}>
        <MetricChip
          icon="people-outline"
          label={t("superAdmin.billableUsers")}
          value={userCountLabel}
          color="#2563EB"
          compact={compact}
        />
        <MetricChip
          icon="card-outline"
          label={t("superAdmin.subscriptionStatus")}
          value={t(statusLabelKey(subscriptionStatus))}
          color={statusColor(subscriptionStatus)}
          compact={compact}
        />
      </View>

      {school.userCountSyncError ? (
        <View style={styles.unavailableBox}>
          <Ionicons name="warning-outline" size={14} color="#B45309" />
          <Text style={styles.unavailableText}>
            {t("superAdmin.userCountSyncFailed", {
              error: school.userCountSyncError,
            })}
          </Text>
        </View>
      ) : null}

      {lastSynced ? (
        <Text style={styles.syncMeta}>
          {t("superAdmin.userCountLastSynced", { time: lastSynced })}
        </Text>
      ) : null}

      {!compact ? (
        <View style={styles.detailsList}>
          <DetailRow
            label={t("superAdmin.usageExpiresAt")}
            value={expiryLabel ?? t("superAdmin.usageNotSet")}
          />
          <DetailRow
            label={t("superAdmin.daysRemaining")}
            value={
              daysLeft != null
                ? t("admin.usageTimeRemainingDays", { count: daysLeft })
                : t("superAdmin.usageNotSet")
            }
            warn={daysLeft != null && daysLeft <= 7}
          />
          <DetailRow
            label={t("superAdmin.showInApp")}
            value={
              school.active ? t("superAdmin.active") : t("superAdmin.hidden")
            }
          />
          <DetailRow
            label={t("superAdmin.billableUsers")}
            value={userCountLabel}
          />
        </View>
      ) : null}
    </View>
  );
}

function MetricChip({
  icon,
  label,
  value,
  color,
  compact,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.chip, compact && styles.chipCompact]}>
      <View style={[styles.chipIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={compact ? 16 : 18} color={color} />
      </View>
      <Text style={styles.chipValue}>{value}</Text>
      <Text style={styles.chipLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function DetailRow({
  label,
  value,
  warn = false,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, warn && styles.detailValueWarn]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
  },
  wrapCompact: {
    marginTop: 12,
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
  },
  chip: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipCompact: {
    padding: 10,
  },
  chipIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  chipValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    minHeight: 22,
  },
  chipLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    lineHeight: 14,
  },
  unavailableBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FFFBEB",
  },
  unavailableText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    color: "#92400E",
  },
  syncMeta: {
    marginTop: 8,
    fontSize: 11,
    color: "#64748B",
  },
  detailsList: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: "#64748B",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
  },
  detailValueWarn: {
    color: "#B45309",
  },
});
