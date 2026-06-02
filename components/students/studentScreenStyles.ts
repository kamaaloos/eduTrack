import { Platform, StyleSheet } from "react-native";
import { FLOATING_TAB_BAR_INSET } from "../../src/constants/tabBar";

const isWeb = Platform.OS === "web";

export const studentScreenStyles = StyleSheet.create({
  scrollContent: {
    paddingTop: isWeb ? 16 : 12,
    paddingBottom: isWeb ? 32 : FLOATING_TAB_BAR_INSET,
    flexGrow: 1,
  },
  listCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  listCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  listCardBody: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 24,
  },
  metricCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  metricTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  metricValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1D4ED8",
    marginTop: 8,
  },
  metricSub: {
    color: "#64748B",
    marginTop: 8,
    lineHeight: 20,
    fontSize: 14,
  },
  highlightCard: {
    backgroundColor: "#1E3A8A",
    padding: 20,
    borderRadius: 12,
    marginTop: 4,
  },
  highlightTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  highlightText: {
    color: "#BFDBFE",
    lineHeight: 24,
    fontSize: 15,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  detailMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailMetaLabel: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
  },
  detailMetaValue: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 15,
  },
  detailSectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginTop: 8,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  detailSubtitle: {
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "600",
    marginBottom: 16,
  },
  detailBody: {
    fontSize: 16,
    lineHeight: 26,
    color: "#334155",
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 15,
  },
});
