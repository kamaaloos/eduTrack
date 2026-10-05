import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";
import { setSchoolAppearance } from "../../src/services/schoolAppearance";
import type { SchoolThemeConfig } from "../../src/types/schoolTheme";
import { validateThemeInput } from "../../src/utils/schoolTheme";
import { showErrorAlert, showSuccessAlert } from "../../src/utils/confirmDialog";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import { SchoolThemeEditor } from "../schoolTheme/SchoolThemeEditor";

export function SchoolAppearanceCard() {
  const { t } = useTranslation();
  const { theme, registryTheme, refreshAppearance } = useSchoolTheme();
  const [draft, setDraft] = useState<SchoolThemeConfig>(theme);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setDraft(theme);
    }, [theme]),
  );

  const handleSave = async () => {
    const error = validateThemeInput(draft);
    if (error) {
      showErrorAlert(t("common.error"), error);
      return;
    }
    setSaving(true);
    try {
      await setSchoolAppearance(draft);
      await refreshAppearance();
      showSuccessAlert(t("common.success"), t("schoolTheme.savedSchool"));
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("schoolTheme.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetToRegistry = () => {
    setDraft({ ...registryTheme });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("schoolTheme.adminCardTitle")}</Text>
      <Text style={styles.subtitle}>{t("schoolTheme.adminCardSubtitle")}</Text>
      <SchoolThemeEditor value={draft} onChange={setDraft} disabled={saving} />
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleResetToRegistry}
          disabled={saving}
        >
          <Text style={styles.secondaryButtonText}>
            {t("schoolTheme.resetToRegistry")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, saving && styles.disabled]}
          onPress={() => void handleSave()}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>{t("common.save")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#1E3A8A",
    fontWeight: "700",
    fontSize: 13,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#1E3A8A",
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  disabled: {
    opacity: 0.7,
  },
});
