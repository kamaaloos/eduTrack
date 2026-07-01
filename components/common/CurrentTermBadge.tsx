import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { useSchoolTerm } from "../../hooks/useSchoolTerm";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";

type CurrentTermBadgeProps = {
  /** Navy dashboard header (student/teacher/parent child). */
  variant?: "header" | "inline";
};

export function CurrentTermBadge({ variant = "header" }: CurrentTermBadgeProps) {
  const { t } = useTranslation();
  const { term, loading } = useSchoolTerm();

  if (loading) {
    return null;
  }

  const isActive = term.status === "active";
  const labelText = isActive
    ? t("common.currentSchoolTerm", { label: term.label })
    : t("common.betweenSchoolTerms", { label: term.label });

  if (variant === "header") {
    return (
      <View
        style={styles.headerWrap}
        accessibilityRole="text"
        accessibilityLabel={labelText}
      >
        <Ionicons
          name="calendar-outline"
          size={14}
          color="#BFDBFE"
          style={styles.headerIcon}
        />
        <Text style={styles.headerText} numberOfLines={1}>
          {labelText}
        </Text>
        {!isActive ? (
          <View style={styles.headerBetweenDot}>
            <Text style={styles.headerBetweenText}>
              {t("common.betweenTermsShort")}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.inlineWrap,
        isActive ? styles.inlineActive : styles.inlineBetween,
      ]}
      accessibilityRole="text"
      accessibilityLabel={labelText}
    >
      <Ionicons
        name="calendar-outline"
        size={16}
        color={isActive ? "#1E3A8A" : "#92400E"}
      />
      <Text
        style={[
          styles.inlineText,
          isActive ? styles.inlineTextActive : styles.inlineTextBetween,
        ]}
        numberOfLines={1}
      >
        {labelText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    flexWrap: "wrap",
    gap: 6,
  },
  headerIcon: {
    marginRight: 2,
  },
  headerText: {
    color: "#E0F2FE",
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  headerBetweenDot: {
    backgroundColor: "rgba(254, 243, 199, 0.25)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  headerBetweenText: {
    color: "#FDE68A",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  inlineWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  inlineActive: {
    backgroundColor: "#EFF6FF",
    borderColor: INNER_CARD_BORDER_GREEN,
  },
  inlineBetween: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  inlineText: {
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
  inlineTextActive: {
    color: "#1E3A8A",
  },
  inlineTextBetween: {
    color: "#92400E",
  },
});
