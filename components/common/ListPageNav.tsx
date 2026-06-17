import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ListPageNavProps = {
  page: number;
  totalPages: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  /** Hide when only one page (default true). */
  hideWhenSinglePage?: boolean;
};

/** Compact previous / next row for paginated lists (4 items per page). */
export function ListPageNav({
  page,
  totalPages,
  canPrev,
  canNext,
  onPrev,
  onNext,
  hideWhenSinglePage = true,
}: ListPageNavProps) {
  const { t } = useTranslation();

  if (hideWhenSinglePage && totalPages <= 1) {
    return null;
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.navBtn, !canPrev && styles.navBtnDisabled]}
        onPress={onPrev}
        disabled={!canPrev}
        accessibilityLabel={t("admin.directoryPrevious")}
      >
        <Ionicons
          name="chevron-back"
          size={18}
          color={canPrev ? "#1E3A8A" : "#94A3B8"}
        />
        <Text style={[styles.navText, !canPrev && styles.navTextDisabled]}>
          {t("admin.directoryPrevious")}
        </Text>
      </TouchableOpacity>

      <Text style={styles.pageLabel}>
        {page + 1} / {totalPages}
      </Text>

      <TouchableOpacity
        style={[styles.navBtn, !canNext && styles.navBtnDisabled]}
        onPress={onNext}
        disabled={!canNext}
        accessibilityLabel={t("admin.directoryNext")}
      >
        <Text style={[styles.navText, !canNext && styles.navTextDisabled]}>
          {t("admin.directoryNext")}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={canNext ? "#1E3A8A" : "#94A3B8"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  navBtnDisabled: {
    backgroundColor: "#F1F5F9",
  },
  navText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  navTextDisabled: {
    color: "#94A3B8",
  },
  pageLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
});
