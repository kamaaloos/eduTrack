import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ABSENCE_REASONS } from "../../src/constants/absenceReasons";
import { AuthContext } from "../../src/context/authContext";
import { submitParentAttendanceResponse } from "../../src/services/parentAttendanceResponse";
import { getAbsenceReasonLabel } from "../../src/utils/attendanceLabels";

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

  const handleSubmit = async () => {
    if (!user?.uid) {
      Alert.alert(t("common.error"), t("common.sessionExpired"));
      return;
    }
    if (!aid) {
      Alert.alert(t("common.error"), t("common.notAvailable"));
      return;
    }
    if (!reasonCode) {
      Alert.alert(
        t("parent.reportAbsenceReason"),
        t("parent.respondAttendanceSubtitle"),
      );
      return;
    }
    if (reasonCode === "other" && !notes.trim()) {
      Alert.alert(
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
      Alert.alert(
        t("common.success"),
        t("parent.respondSuccess"),
        [{ text: t("common.confirm"), onPress: () => router.back() }],
      );
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error ? err.message : t("parent.respondError"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.header} edges={["top"]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel={t("common.back")}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>
              {t("parent.respondAttendanceTitle")}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {childName} · {dateLabel}
            </Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="alert-circle" size={26} color="#FCA5A5" />
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
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
            onPress={handleSubmit}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  flex: { flex: 1 },
  header: {
    backgroundColor: "#1E40AF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitles: { flex: 1, minWidth: 0 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  headerSubtitle: { color: "#BFDBFE", fontSize: 13, marginTop: 4 },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(220,38,38,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 20, paddingBottom: 40 },
  alertBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  alertText: { color: "#991B1B", fontSize: 14, lineHeight: 20 },
  alertBold: { fontWeight: "800" },
  label: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  reasonList: { gap: 8, marginTop: 12 },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
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
  reasonLabel: { flex: 1, fontSize: 15, color: "#334155" },
  reasonLabelActive: { color: "#1E3A8A", fontWeight: "600" },
  notesLabel: { marginTop: 24 },
  notesInput: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#16A34A",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});
