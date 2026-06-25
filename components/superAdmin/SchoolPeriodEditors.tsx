import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  updateSchoolTestingPeriod,
  updateSchoolUsagePeriod,
} from "../../src/services/schoolRegistryAdmin";
import { validateUsageExpiryDate } from "../../src/utils/validation";
import { FormDateInput } from "../common/FormDateInput";

type SchoolPeriodEditorsProps = {
  schoolId: string;
  testingExpiresAt: string | null | undefined;
  usageExpiresAt: string | null | undefined;
  onTestingSaved: (next: string) => void;
  onUsageSaved: (next: string | null) => void;
};

export function SchoolPeriodEditors({
  schoolId,
  testingExpiresAt,
  usageExpiresAt,
  onTestingSaved,
  onUsageSaved,
}: SchoolPeriodEditorsProps) {
  const { t } = useTranslation();
  const [testingDate, setTestingDate] = useState(testingExpiresAt?.trim() ?? "");
  const [usageDate, setUsageDate] = useState(usageExpiresAt?.trim() ?? "");
  const [savingTesting, setSavingTesting] = useState(false);
  const [savingUsage, setSavingUsage] = useState(false);

  useEffect(() => {
    setTestingDate(testingExpiresAt?.trim() ?? "");
  }, [testingExpiresAt]);

  useEffect(() => {
    setUsageDate(usageExpiresAt?.trim() ?? "");
  }, [usageExpiresAt]);

  const saveTesting = async () => {
    const trimmed = testingDate.trim();
    if (!trimmed) {
      Alert.alert(t("superAdmin.validation"), t("superAdmin.testingPeriodRequired"));
      return;
    }
    if (!validateUsageExpiryDate(trimmed)) {
      Alert.alert(t("superAdmin.validation"), t("superAdmin.testingPeriodInvalid"));
      return;
    }

    setSavingTesting(true);
    try {
      await updateSchoolTestingPeriod(schoolId, trimmed);
      onTestingSaved(trimmed);
      Alert.alert(t("common.success"), t("superAdmin.testingPeriodSaved"));
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error ? err.message : t("superAdmin.testingPeriodSaveFailed"),
      );
    } finally {
      setSavingTesting(false);
    }
  };

  const saveUsage = async () => {
    const trimmed = usageDate.trim();
    if (trimmed && !validateUsageExpiryDate(trimmed)) {
      Alert.alert(t("superAdmin.validation"), t("superAdmin.usagePeriodInvalid"));
      return;
    }

    setSavingUsage(true);
    try {
      await updateSchoolUsagePeriod(schoolId, trimmed);
      onUsageSaved(trimmed || null);
      Alert.alert(t("common.success"), t("superAdmin.usagePeriodSaved"));
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error ? err.message : t("superAdmin.usagePeriodSaveFailed"),
      );
    } finally {
      setSavingUsage(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>{t("superAdmin.periodsSectionTitle")}</Text>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>{t("superAdmin.editTestingPeriod")}</Text>
        <Text style={styles.hint}>{t("superAdmin.testingExpiresAtHint")}</Text>
        <Text style={styles.label}>{t("superAdmin.testingExpiresAt")}</Text>
        <FormDateInput
          style={styles.input}
          value={testingDate}
          onChangeText={setTestingDate}
          placeholder={t("superAdmin.usageExpiresAtPlaceholder")}
          editable={!savingTesting}
        />
        <TouchableOpacity
          style={[styles.button, savingTesting && styles.buttonDisabled]}
          onPress={() => void saveTesting()}
          disabled={savingTesting}
        >
          {savingTesting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="flask-outline" size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>{t("superAdmin.saveTestingPeriod")}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>{t("superAdmin.editUsagePeriod")}</Text>
        <Text style={styles.hint}>{t("superAdmin.usageExpiresAtHint")}</Text>
        <Text style={styles.label}>{t("superAdmin.usageExpiresAt")}</Text>
        <FormDateInput
          style={styles.input}
          value={usageDate}
          onChangeText={setUsageDate}
          placeholder={t("superAdmin.usageExpiresAtPlaceholder")}
          editable={!savingUsage}
        />
        <TouchableOpacity
          style={[styles.buttonSecondary, savingUsage && styles.buttonDisabled]}
          onPress={() => void saveUsage()}
          disabled={savingUsage}
        >
          {savingUsage ? (
            <ActivityIndicator color="#1E3A8A" size="small" />
          ) : (
            <>
              <Ionicons name="card-outline" size={18} color="#1E3A8A" />
              <Text style={styles.buttonSecondaryText}>
                {t("superAdmin.saveUsagePeriod")}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  block: {
    gap: 4,
  },
  blockTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginBottom: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1E3A8A",
    borderRadius: 12,
    paddingVertical: 14,
  },
  buttonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonSecondaryText: {
    color: "#1E3A8A",
    fontSize: 15,
    fontWeight: "700",
  },
});
