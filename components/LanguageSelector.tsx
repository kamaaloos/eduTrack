import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../src/context/languageContext";
import type { AppLanguage } from "../src/i18n/languages";

type LanguageSelectorProps = {
  compact?: boolean;
  title?: string;
  showTitle?: boolean;
  variant?: "default" | "nav";
};

export function LanguageSelector({
  compact,
  title,
  showTitle = true,
  variant = "default",
}: LanguageSelectorProps) {
  const { t } = useTranslation();
  const { language, setLanguage, languages } = useLanguage();

  const isNav = variant === "nav";

  return (
    <View
      style={[
        styles.wrap,
        compact && styles.wrapCompact,
        isNav && styles.wrapNav,
      ]}
    >
      {showTitle ? (
        title ? (
          <Text style={[styles.title, isNav && styles.titleNav]}>{title}</Text>
        ) : (
          <Text style={[styles.title, isNav && styles.titleNav]}>
            {t("language.choose")}
          </Text>
        )
      ) : null}
      <View style={[styles.row, isNav && styles.rowNav]}>
        {languages.map((item) => {
          const active = language === item.code;
          return (
            <TouchableOpacity
              key={item.code}
              style={[
                styles.chip,
                isNav && styles.chipNav,
                active && styles.chipActive,
                isNav && active && styles.chipNavActive,
              ]}
              onPress={() => void setLanguage(item.code as AppLanguage)}
              accessibilityLabel={t(item.labelKey)}
            >
              <Text
                style={[
                  styles.chipText,
                  isNav && styles.chipTextNav,
                  active && styles.chipTextActive,
                ]}
              >
                {item.nativeName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    marginBottom: 8,
  },
  wrapCompact: {
    marginTop: 8,
  },
  wrapNav: {
    marginTop: 0,
    marginBottom: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 10,
    textAlign: "center",
  },
  titleNav: {
    marginBottom: 6,
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  rowNav: {
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipNav: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: "#1E3A8A",
    borderColor: "#1E3A8A",
  },
  chipNavActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  chipTextNav: {
    fontSize: 12,
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
});
