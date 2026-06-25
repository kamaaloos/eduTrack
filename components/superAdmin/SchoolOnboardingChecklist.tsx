import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { buildSchoolOnboardingSteps } from "../../src/utils/schoolOnboardingCommands";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";

type SchoolOnboardingChecklistProps = {
  projectId: string;
  registryProjectId?: string | null;
};

async function copyCommand(command: string, t: (key: string) => string) {
  if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(command);
    Alert.alert(t("superAdmin.onboardingCopied"));
    return;
  }

  try {
    await Share.share({ message: command });
  } catch {
    Alert.alert(t("superAdmin.onboardingCopyFailed"), command);
  }
}

export function SchoolOnboardingChecklist({
  projectId,
  registryProjectId,
}: SchoolOnboardingChecklistProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const steps = useMemo(
    () => buildSchoolOnboardingSteps(projectId, registryProjectId),
    [projectId, registryProjectId],
  );

  const hasProjectId = projectId.trim().length > 0;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
      >
        <View style={styles.headerTextBlock}>
          <Text style={styles.sectionTitle}>{t("superAdmin.onboardingTitle")}</Text>
          <Text style={styles.hint}>{t("superAdmin.onboardingSubtitle")}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.card}>
          {!hasProjectId ? (
            <Text style={styles.warning}>{t("superAdmin.onboardingNeedProjectId")}</Text>
          ) : null}

          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{t(`superAdmin.${step.titleKey}`)}</Text>
                <Text style={styles.stepHint}>
                  {t(`superAdmin.${step.descriptionKey}`)}
                </Text>
                {step.command ? (
                  <View style={styles.commandBlock}>
                    <Text selectable style={styles.commandText}>
                      {step.command}
                    </Text>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => void copyCommand(step.command!, t)}
                      disabled={
                        !hasProjectId &&
                        (step.id === "deploy-school" || step.id === "provision-school")
                      }
                    >
                      <Ionicons name="copy-outline" size={16} color="#1E3A8A" />
                      <Text style={styles.copyButtonText}>
                        {t("superAdmin.onboardingCopyCommand")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  headerTextBlock: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#94A3B8",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    gap: 16,
  },
  warning: {
    fontSize: 13,
    lineHeight: 20,
    color: "#B45309",
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepBadgeText: {
    color: "#1E3A8A",
    fontWeight: "700",
    fontSize: 13,
  },
  stepContent: {
    flex: 1,
    gap: 6,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  stepHint: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },
  commandBlock: {
    marginTop: 4,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    padding: 10,
    gap: 8,
  },
  commandText: {
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
    fontSize: 12,
    lineHeight: 18,
    color: "#0F172A",
  },
  copyButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  copyButtonText: {
    color: "#1E3A8A",
    fontSize: 12,
    fontWeight: "600",
  },
});
