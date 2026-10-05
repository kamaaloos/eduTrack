import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SCHOOL_THEME_PRESETS } from "../../src/constants/schoolThemeDefaults";
import type { SchoolFontKey, SchoolThemeConfig } from "../../src/types/schoolTheme";
import { SCHOOL_FONT_KEYS } from "../../src/types/schoolTheme";
import { isValidThemeHex } from "../../src/utils/schoolTheme";

type SchoolThemeEditorProps = {
  value: SchoolThemeConfig;
  onChange: (next: SchoolThemeConfig) => void;
  disabled?: boolean;
};

function ColorField({
  label,
  value,
  onChangeText,
  disabled,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
}) {
  const valid = isValidThemeHex(value);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.colorRow}>
        <View
          style={[
            styles.swatch,
            { backgroundColor: valid ? value : "#CBD5E1" },
          ]}
        />
        <TextInput
          style={[styles.input, !valid && styles.inputInvalid]}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!disabled}
          placeholder="#1E3A8A"
          placeholderTextColor="#94A3B8"
        />
      </View>
    </View>
  );
}

export function SchoolThemeEditor({
  value,
  onChange,
  disabled,
}: SchoolThemeEditorProps) {
  const { t } = useTranslation();

  const fontOptions = useMemo(
    () =>
      SCHOOL_FONT_KEYS.map((key) => ({
        key,
        label: t(`schoolTheme.font.${key}`),
      })),
    [t],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>{t("schoolTheme.editorHint")}</Text>

      <Text style={styles.presetsLabel}>{t("schoolTheme.presets")}</Text>
      <View style={styles.presetsRow}>
        {SCHOOL_THEME_PRESETS.map((preset) => {
          const selected =
            value.primaryColor.toUpperCase() ===
              preset.theme.primaryColor.toUpperCase() &&
            value.accentColor.toUpperCase() ===
              preset.theme.accentColor.toUpperCase();
          return (
            <TouchableOpacity
              key={preset.id}
              style={[styles.presetChip, selected && styles.presetChipSelected]}
              disabled={disabled}
              onPress={() => onChange({ ...preset.theme })}
            >
              <View
                style={[
                  styles.presetDot,
                  { backgroundColor: preset.theme.primaryColor },
                ]}
              />
              <Text
                style={[
                  styles.presetText,
                  selected && styles.presetTextSelected,
                ]}
              >
                {t(preset.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ColorField
        label={t("schoolTheme.primaryColor")}
        value={value.primaryColor}
        disabled={disabled}
        onChangeText={(text) =>
          onChange({ ...value, primaryColor: text.trim() })
        }
      />
      <ColorField
        label={t("schoolTheme.accentColor")}
        value={value.accentColor}
        disabled={disabled}
        onChangeText={(text) =>
          onChange({ ...value, accentColor: text.trim() })
        }
      />
      <ColorField
        label={t("schoolTheme.backgroundColor")}
        value={value.backgroundColor}
        disabled={disabled}
        onChangeText={(text) =>
          onChange({ ...value, backgroundColor: text.trim() })
        }
      />

      <Text style={styles.label}>{t("schoolTheme.fontLabel")}</Text>
      <View style={styles.presetsRow}>
        {fontOptions.map((option) => {
          const selected = value.fontKey === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.presetChip, selected && styles.presetChipSelected]}
              disabled={disabled}
              onPress={() =>
                onChange({ ...value, fontKey: option.key as SchoolFontKey })
              }
            >
              <Text
                style={[
                  styles.presetText,
                  selected && styles.presetTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={[
          styles.preview,
          { backgroundColor: value.primaryColor || "#1E3A8A" },
        ]}
      >
        <Text style={styles.previewTitle}>{t("schoolTheme.previewTitle")}</Text>
        <Text style={styles.previewSub}>{t("schoolTheme.previewSubtitle")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },
  presetsLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginTop: 4,
  },
  presetsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  presetChipSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#93C5FD",
  },
  presetDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  presetText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  presetTextSelected: {
    color: "#1E3A8A",
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  inputInvalid: {
    borderColor: "#FCA5A5",
  },
  preview: {
    marginTop: 6,
    borderRadius: 14,
    padding: 16,
  },
  previewTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  previewSub: {
    color: "#E2E8F0",
    fontSize: 13,
    marginTop: 4,
  },
});
