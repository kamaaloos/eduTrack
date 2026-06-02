import { Ionicons } from "@expo/vector-icons";
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
import { ParentScreenShell } from "../../components/parent/ParentScreenShell";
import { ABSENCE_REASONS } from "../../src/constants/absenceReasons";
import { AuthContext } from "../../src/context/authContext";
import { submitParentAbsenceReport } from "../../src/services/parentAbsence";
import { getAbsenceReasonLabel } from "../../src/utils/attendanceLabels";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";

export default function ReportAbsenceScreen() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { studentId, studentName, className, classId } = useLocalSearchParams<{
    studentId: string;
    studentName?: string;
    className?: string;
    classId?: string;
  }>();

  const [reasonCode, setReasonCode] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const childName = studentName ? String(studentName) : t("common.student");
  const sid = String(studentId ?? "");
  const subtitle = className
    ? `${childName} · ${className}`
    : childName;

  const handleSubmit = async () => {
    if (!user?.uid) {
      showErrorAlert(t("common.error"), t("common.sessionExpired"));
      return;
    }
    if (!sid) {
      showErrorAlert(t("common.error"), t("common.notAvailable"));
      return;
    }
    if (!reasonCode) {
      showErrorAlert(
        t("parent.reportAbsenceReason"),
        t("parent.reportAbsenceSubtitle"),
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
      await submitParentAbsenceReport({
        parentId: user.uid,
        studentId: sid,
        reasonCode,
        notes: notes.trim() || undefined,
        classId: classId ? String(classId) : undefined,
      });
      showSuccessAlert(t("common.success"), t("parent.reportAbsenceSuccess"));
      router.back();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("parent.reportAbsenceError"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ParentScreenShell
      title={t("parent.reportAbsenceTitle")}
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
            <Text style={styles.label}>{t("parent.reportAbsenceReason")}</Text>
            <Text style={styles.hint}>{t("parent.reportAbsenceSubtitle")}</Text>

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
                  {t("parent.reportAbsenceSubmit")}
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
  content: {
    paddingBottom: 32,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  hint: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 14,
  },
  reasonList: { gap: 8 },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  reasonRowActive: {
    borderColor: "#1E40AF",
    backgroundColor: "#EFF6FF",
  },
  reasonLabel: {
    flex: 1,
    fontSize: 15,
    color: "#334155",
  },
  reasonLabelActive: {
    color: "#1E3A8A",
    fontWeight: "600",
  },
  notesLabel: { marginTop: 24 },
  notesInput: {
    marginTop: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    minHeight: 100,
    fontSize: 15,
    color: "#0F172A",
  },
  submitBtn: {
    marginTop: 28,
    backgroundColor: "#1E40AF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});
