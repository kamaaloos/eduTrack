export const PREVIEW_MAX_LENGTH = 90;

export function getPreviewText(text: string, max = PREVIEW_MAX_LENGTH) {
  const normalized = (text || "").trim();
  if (normalized.length <= max) {
    return { preview: normalized, isTruncated: false };
  }
  return {
    preview: `${normalized.slice(0, max).trim()}…`,
    isTruncated: true,
  };
}

export function getHomeworkColor(daysLeft: number) {
  if (daysLeft <= 1) return { bg: "#FEE2E2", text: "#DC2626" };
  if (daysLeft <= 3) return { bg: "#FEF3C7", text: "#D97706" };
  return { bg: "#DCFCE7", text: "#16A34A" };
}

export type AttendanceColor = {
  bg: string;
  border: string;
  text: string;
  label: string;
};

/** Absent stays red until parent submits a reason; then shows green (excused). */
export function getAttendanceColor(
  status: string,
  parentResponse?: { reasonCode?: string; reason?: string } | null,
): AttendanceColor {
  if (status === "absent") {
    if (parentResponse?.reasonCode || parentResponse?.reason) {
      return {
        bg: "#DCFCE7",
        border: "#16A34A",
        text: "#16A34A",
        label: "EXCUSED",
      };
    }
    return {
      bg: "#FEE2E2",
      border: "#DC2626",
      text: "#DC2626",
      label: "ABSENT",
    };
  }

  switch (status) {
    case "present":
      return {
        bg: "#DCFCE7",
        border: "#16A34A",
        text: "#16A34A",
        label: "PRESENT",
      };
    case "late":
      return {
        bg: "#FEF3C7",
        border: "#D97706",
        text: "#D97706",
        label: "LATE",
      };
    default:
      return {
        bg: "#F3F4F6",
        border: "#9CA3AF",
        text: "#6B7280",
        label: (status || "unknown").toUpperCase(),
      };
  }
}

export function getRemarkColor(type: string) {
  switch (type) {
    case "performance":
      return { bg: "#DCFCE7", border: "#16A34A" };
    case "attendance":
      return { bg: "#DBEAFE", border: "#0284C7" };
    case "homework":
      return { bg: "#FEF3C7", border: "#D97706" };
    case "missing":
      return { bg: "#FEE2E2", border: "#DC2626" };
    default:
      return { bg: "#FFFBEB", border: "#FBBF24" };
  }
}

