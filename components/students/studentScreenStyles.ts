import { Platform, StyleSheet } from "react-native";
import { FLOATING_TAB_BAR_INSET } from "../../src/constants/tabBar";
import {
  INNER_CARD_BORDER_GREEN,
  INNER_CARD_BORDER_RED,
} from "../../src/constants/innerCardBorders";

const isWeb = Platform.OS === "web";

/** Centered card column on student tab screens (attendance, messages, etc.). */
export const STUDENT_LIST_MAX_WIDTH = 480;
/** Student hamburger menu → Reports (`/(students)/report-card`) on web. */
export const STUDENT_MENU_REPORT_WEB_MAX_WIDTH = 720;

export const studentScreenStyles = StyleSheet.create({
  scrollContent: {
    paddingTop: isWeb ? 16 : 12,
    paddingBottom: isWeb ? 32 : FLOATING_TAB_BAR_INSET,
    flexGrow: 1,
  },
  listStack: {
    width: "100%",
    maxWidth: STUDENT_LIST_MAX_WIDTH,
    alignSelf: "center",
  },
  listCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    borderLeftWidth: 4,
    borderLeftColor: INNER_CARD_BORDER_RED,
    width: "100%",
    maxWidth: STUDENT_LIST_MAX_WIDTH,
    alignSelf: "center",
  },
  listCardDirect: {
    borderLeftColor: "#7C3AED",
  },
  listCardBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EDE9FE",
    color: "#6D28D9",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
    overflow: "hidden",
  },
  listCardSender: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7C3AED",
    marginBottom: 6,
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
    width: "100%",
    maxWidth: STUDENT_LIST_MAX_WIDTH,
    alignSelf: "center",
  },
  metricCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    width: "100%",
    maxWidth: STUDENT_LIST_MAX_WIDTH,
    alignSelf: "center",
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
    width: "100%",
    maxWidth: STUDENT_LIST_MAX_WIDTH,
    alignSelf: "center",
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
    borderColor: INNER_CARD_BORDER_GREEN,
    width: "100%",
    maxWidth: STUDENT_LIST_MAX_WIDTH,
    alignSelf: "center",
  },
  detailSender: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C3AED",
    marginBottom: 12,
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
  detailDeleteBtn: {
    marginTop: 16,
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    width: "100%",
    maxWidth: STUDENT_LIST_MAX_WIDTH,
    alignSelf: "center",
  },
  detailDeleteBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
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
  reportShellContent: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
    ...(isWeb
      ? {
          maxWidth: STUDENT_MENU_REPORT_WEB_MAX_WIDTH,
          alignSelf: "center",
        }
      : null),
  },
});
