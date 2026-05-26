import type { TFunction } from "i18next";

/** Translated attendance status label for UI (replaces English labels from getAttendanceColor). */
export function getAttendanceStatusLabel(
  t: TFunction,
  status: string,
  parentResponse?: { reasonCode?: string; reason?: string } | null,
): string {
  if (status === "absent") {
    if (parentResponse?.reasonCode || parentResponse?.reason) {
      return t("common.excused");
    }
    return t("common.absent");
  }
  if (status === "present") return t("common.present");
  if (status === "late") return t("common.late");
  if (!status) return t("common.unknown");
  return status;
}

/** Translate stored absence reason code or fallback text. */
export function getAbsenceReasonLabel(t: TFunction, reasonCode?: string, reason?: string): string {
  if (reasonCode) {
    const key = `absenceReason.${reasonCode}`;
    const translated = t(key);
    if (translated !== key) return translated;
  }
  return reason?.trim() || t("common.unknown");
}
