import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";

type DirectoryPaginationProps = {
  rangeStart: number;
  rangeEnd: number;
  totalCount: number;
  page: number;
  totalPages: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function DirectoryPagination({
  rangeStart,
  rangeEnd,
  totalCount,
  page,
  totalPages,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: DirectoryPaginationProps) {
  const { t } = useTranslation();
  const { theme } = useSchoolTheme();
  const primary = theme.primaryColor;

  if (totalCount === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.summary}>
        {t("admin.directoryShowing", {
          start: rangeStart,
          end: rangeEnd,
          total: totalCount,
        })}
      </Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.navBtn,
            { backgroundColor: `${primary}14` },
            !canPrev && styles.navBtnDisabled,
          ]}
          onPress={onPrev}
          disabled={!canPrev}
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={canPrev ? primary : "#94A3B8"}
          />
          <Text
            style={[
              styles.navText,
              { color: primary },
              !canPrev && styles.navTextDisabled,
            ]}
          >
            {t("admin.directoryPrevious")}
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageLabel}>
          {page + 1} / {totalPages}
        </Text>

        <TouchableOpacity
          style={[
            styles.navBtn,
            { backgroundColor: `${primary}14` },
            !canNext && styles.navBtnDisabled,
          ]}
          onPress={onNext}
          disabled={!canNext}
        >
          <Text
            style={[
              styles.navText,
              { color: primary },
              !canNext && styles.navTextDisabled,
            ]}
          >
            {t("admin.directoryNext")}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={canNext ? primary : "#94A3B8"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.85)",
  },
  summary: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  navBtnDisabled: {
    backgroundColor: "#F1F5F9",
  },
  navText: {
    fontSize: 14,
    fontWeight: "700",
  },
  navTextDisabled: {
    color: "#94A3B8",
  },
  pageLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
});
