import { router, useLocalSearchParams } from "expo-router";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ParentScreenShell } from "../../components/parent/ParentScreenShell";
import { ABSENCE_REASONS } from "../../src/constants/absenceReasons";
import { AuthContext } from "../../src/context/authContext";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import { submitParentAttendanceResponse } from "../../src/services/parentAttendanceResponse";
import { getAbsenceReasonLabel } from "../../src/utils/attendanceLabels";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";

export default function RespondAttendanceScreen() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { attendanceId, studentName, date } = useLocalSearchParams<{
    attendanceId: string;
    studentName?: string;
    date?: string;
  }>();

  const [reasonCode, setReasonCode] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const aid = String(attendanceId ?? "");
  const childName = studentName ? String(studentName) : t("common.student");
  const dateLabel = date ? String(date) : t("common.today");
  const subtitle = `${childName} · ${dateLabel}`;

  const handleSubmit = async () => {
    if (!user?.uid) {
      showErrorAlert(t("common.error"), t("common.sessionExpired"));
      return;
    }
    if (!aid) {
      showErrorAlert(t("common.error"), t("common.notAvailable"));
      return;
    }
    if (!reasonCode) {
      showErrorAlert(
        t("parent.reportAbsenceReason"),
        t("parent.respondAttendanceSubtitle"),
      );
      return;
    }
    if (reasonCode === "other" && !notes.trim()) {
      showErrorAlert(
        t("parent.reportAbsenceNotes"),
        t("parent.reportAbsenceReason"),
      );
      return;
    }

    setSubmitting(true);
    try {
      await submitParentAttendanceResponse({
        attendanceId: aid,
        parentId: user.uid,
        reasonCode,
        notes: notes.trim() || undefined,
      });
      showSuccessAlert(t("common.success"), t("parent.respondSuccess"));
      router.back();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("parent.respondError"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ParentScreenShell
      title={t("parent.respondAttendanceTitle")}
      subtitle={subtitle}
      showBack
      showMenu={false}
      scroll={false}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <View style={styles.alertBox}>
              <Text style={styles.alertText}>
                {t("parent.respondAttendanceSubtitle")}
              </Text>
            </View>

            <Text style={styles.label}>{t("parent.reportAbsenceReason")}</Text>
            <View style={styles.reasonList}>
              {ABSENCE_REASONS.map((item) => {
                const active = reasonCode === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.reasonRow, active && styles.reasonRowActive]}
                    onPress={() => setReasonCode(item.value)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={active ? "radio-button-on" : "radio-button-off"}
                      size={22}
                      color={active ? "#1E40AF" : "#94A3B8"}
                    />
                    <Text
                      style={[
                        styles.reasonLabel,
                        active && styles.reasonLabelActive,
                      ]}
                    >
                      {getAbsenceReasonLabel(t, item.value)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.label, styles.notesLabel]}>
              {t("parent.reportAbsenceNotes")} ({t("common.optional")})
            </Text>
            <TextInput
              style={styles.notesInput}
              placeholder={t("parent.reportAbsenceNotes")}
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitDisabled]}
              onPress={() => void handleSubmit()}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>
                  {t("parent.respondExplain")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ParentScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 32 },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    padding: 16,
  },
  alertBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  alertText: { color: "#991B1B", fontSize: 14, lineHeight: 20 },
  label: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  reasonList: { gap: 8, marginTop: 12 },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  reasonRowActive: {
    borderColor: "#1E40AF",
    backgroundColor: "#EFF6FF",
  },
  reasonLabel: { flex: 1, fontSize: 15, color: "#334155" },
  reasonLabelActive: { color: "#1E3A8A", fontWeight: "600" },
  notesLabel: { marginTop: 24 },
  notesInput: {
    marginTop: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    padding: 14,
    minHeight: 100,
    fontSize: 15,
    color: "#0F172A",
  },
  submitBtn: {
    marginTop: 28,
    backgroundColor: "#16A34A",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});
