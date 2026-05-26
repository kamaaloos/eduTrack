import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../src/context/languageContext";
import type { AppLanguage } from "../src/i18n/languages";

type LanguageSelectorProps = {
  compact?: boolean;
  title?: string;
};

export function LanguageSelector({ compact, title }: LanguageSelectorProps) {
  const { t } = useTranslation();
  const { language, setLanguage, languages } = useLanguage();

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {!title ? (
        <Text style={styles.title}>{t("language.choose")}</Text>
      ) : null}
      <View style={styles.row}>
        {languages.map((item) => {
          const active = language === item.code;
          return (
            <TouchableOpacity
              key={item.code}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => void setLanguage(item.code as AppLanguage)}
              accessibilityLabel={t(item.labelKey)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
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
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 10,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: "#1E3A8A",
    borderColor: "#1E3A8A",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
});
