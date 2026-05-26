export type AbsenceReason = {
  value: string;
  label: string;
};

export const ABSENCE_REASONS: AbsenceReason[] = [
  { value: "sickness", label: "Sickness / illness" },
  { value: "family_separation", label: "Family separation / emergency" },
  { value: "medical_appointment", label: "Medical appointment" },
  { value: "religious", label: "Religious observance" },
  { value: "authorized_leave", label: "Authorized leave" },
  { value: "transport", label: "Transport / travel" },
  { value: "other", label: "Other" },
];

export function absenceReasonLabel(value: string): string {
  return ABSENCE_REASONS.find((r) => r.value === value)?.label ?? value;
}
