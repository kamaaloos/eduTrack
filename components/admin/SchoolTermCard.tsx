import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  finishSchoolTerm,
  getSchoolTermRecord,
  startSchoolTerm,
  type SchoolTermProgress,
} from "../../src/services/schoolTerm";
import { resolveSchoolTerm } from "../../src/utils/schoolTerm";
import type { SchoolTermRecord } from "../../src/types/schoolTerm";
import { defaultSchoolTermLabel } from "../../src/utils/academicYear";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import {
  confirmAction,
  confirmDestructiveAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";

type SchoolTermCardProps = {
  adminUid: string;
};

export function SchoolTermCard({ adminUid }: SchoolTermCardProps) {
  const { t } = useTranslation();
  const [term, setTerm] = useState<SchoolTermRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState(defaultSchoolTermLabel());

  const loadTerm = useCallback(async () => {
    setLoading(true);
    try {
      const record = await getSchoolTermRecord();
      setTerm(record);
      if (record?.label) {
        setLabelDraft(record.label);
      }
    } catch (err) {
      console.error("school term load:", err);
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.schoolTermLoadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  const resolved = resolveSchoolTerm(term);
  const isActive = resolved.status === "active";
  const canStart = resolved.status === "between";

  useFocusEffect(
    useCallback(() => {
      void loadTerm();
    }, [loadTerm]),
  );

  const handleProgress = useCallback((progress: SchoolTermProgress) => {
    setProgressText(
      t("admin.schoolTermPurging", {
        stage: progress.stage,
        count: progress.deleted,
      }),
    );
  }, [t]);

  const handleFinish = async () => {
    const confirmed = await confirmDestructiveAction(
      t("admin.schoolTermFinishTitle"),
      t("admin.schoolTermFinishMessage"),
      t("admin.schoolTermFinishConfirm"),
      t("common.cancel"),
    );
    if (!confirmed) return;

    setBusy(true);
    setProgressText(t("admin.schoolTermPurgingStart"));
    try {
      const result = await finishSchoolTerm(adminUid, handleProgress);
      setTerm(result.term);
      const total =
        result.deleted.attendance +
        result.deleted.homework +
        result.deleted.exams +
        result.deleted.remarks +
        result.deleted.announcements +
        result.deleted.grades +
        result.deleted.examResults +
        result.deleted.notifications +
        result.deleted.parentRemarks +
        result.deleted.schedules +
        result.deleted.parentComplaints;
      showSuccessAlert(
        t("admin.schoolTermFinishDoneTitle"),
        t("admin.schoolTermFinishDoneMessage", {
          label: result.term.label,
          count: total,
        }),
      );
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code === "SCHOOL_TERM_ALREADY_BETWEEN") {
        showErrorAlert(t("common.error"), t("admin.schoolTermAlreadyBetween"));
      } else {
        showErrorAlert(
          t("common.error"),
          err instanceof Error ? err.message : t("admin.schoolTermFinishFailed"),
        );
      }
    } finally {
      setBusy(false);
      setProgressText(null);
    }
  };

  const handleStart = async () => {
    const confirmed = await confirmAction(
      t("admin.schoolTermStartTitle"),
      t("admin.schoolTermStartMessage", { label: labelDraft.trim() || defaultSchoolTermLabel() }),
      t("admin.schoolTermStartConfirm"),
      t("common.cancel"),
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const record = await startSchoolTerm(adminUid, labelDraft);
      setTerm(record);
      setLabelDraft(record.label);
      showSuccessAlert(
        t("admin.schoolTermStartDoneTitle"),
        t("admin.schoolTermStartDoneMessage", { label: record.label }),
      );
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code === "SCHOOL_TERM_ALREADY_ACTIVE") {
        showErrorAlert(t("common.error"), t("admin.schoolTermAlreadyActive"));
      } else {
        showErrorAlert(
          t("common.error"),
          err instanceof Error ? err.message : t("admin.schoolTermStartFailed"),
        );
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("admin.schoolTermTitle")}</Text>
      <Text style={styles.hint}>{t("admin.schoolTermHint")}</Text>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>{t("admin.schoolTermCurrentLabel")}</Text>
        <Text style={styles.statusValue}>{resolved.label}</Text>
      </View>
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>{t("admin.schoolTermStatusLabel")}</Text>
        <Text style={[styles.badge, isActive ? styles.badgeActive : styles.badgeBetween]}>
          {isActive
            ? t("admin.schoolTermStatusActive")
            : t("admin.schoolTermStatusBetween")}
        </Text>
      </View>

      {canStart ? (
        <TextInput
          value={labelDraft}
          onChangeText={setLabelDraft}
          placeholder={t("admin.schoolTermLabelPlaceholder")}
          style={styles.input}
          editable={!busy}
        />
      ) : null}

      {progressText ? (
        <Text style={styles.progress}>{progressText}</Text>
      ) : null}

      <View style={styles.actions}>
        {isActive ? (
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger, busy && styles.buttonDisabled]}
            onPress={() => void handleFinish()}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonDangerText}>
                {t("admin.schoolTermFinishButton")}
              </Text>
            )}
          </TouchableOpacity>
        ) : null}

        {canStart ? (
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, busy && styles.buttonDisabled]}
            onPress={() => void handleStart()}
            disabled={busy}
          >
            <Text style={styles.buttonPrimaryText}>
              {t("admin.schoolTermStartButton")}
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => void loadTerm()}
          disabled={busy}
        >
          <Text style={styles.linkButtonText}>{t("common.refresh")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  hint: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  statusValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  badgeActive: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  badgeBetween: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  input: {
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  progress: {
    fontSize: 12,
    color: "#64748B",
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#2563EB",
  },
  buttonPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  buttonDanger: {
    backgroundColor: "#DC2626",
  },
  buttonDangerText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  linkButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
  },
  linkButtonText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 13,
  },
});
