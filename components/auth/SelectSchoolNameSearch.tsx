import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { SchoolRecord } from "../../src/types/school";
import { filterSchoolsByNameQuery } from "../../src/utils/schoolNameSearch";

type SelectSchoolNameSearchProps = {
  schools: SchoolRecord[];
  connecting: boolean;
  onSelectSchool: (school: SchoolRecord) => void;
};

export function SelectSchoolNameSearch({
  schools,
  connecting,
  onSelectSchool,
}: SelectSchoolNameSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const suggestions = useMemo(
    () => filterSchoolsByNameQuery(schools, query),
    [schools, query],
  );

  const trimmed = query.trim();
  const showNotFound = trimmed.length > 0 && suggestions.length === 0;

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{t("selectSchool.writeYourSchool")}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="search" size={18} color="#64748B" />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={t("selectSchool.writeYourSchoolPlaceholder")}
          placeholderTextColor="#94A3B8"
          autoCapitalize="words"
          autoCorrect={false}
          editable={!connecting}
          returnKeyType="search"
          accessibilityLabel={t("selectSchool.writeYourSchool")}
        />
        {query.length > 0 ? (
          <TouchableOpacity
            onPress={() => setQuery("")}
            hitSlop={8}
            accessibilityLabel={t("common.cancel")}
          >
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {showNotFound ? (
        <View style={styles.emptyCard}>
          <Ionicons name="school-outline" size={36} color="#94A3B8" />
          <Text style={styles.emptyText}>{t("selectSchool.notFound")}</Text>
        </View>
      ) : null}

      {suggestions.length > 0 ? (
        <View style={styles.schoolList}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.schoolCard}
              onPress={() => onSelectSchool(item)}
              disabled={connecting}
              activeOpacity={0.85}
            >
              {item.logoUrl ? (
                <Image
                  source={{ uri: item.logoUrl }}
                  style={styles.schoolLogo}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.schoolIcon}>
                  <Ionicons name="business" size={24} color="#1E3A8A" />
                </View>
              )}
              <View style={styles.schoolInfo}>
                <Text style={styles.schoolName}>{item.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: "#0F172A",
    padding: 0,
  },
  schoolList: {
    gap: 12,
  },
  schoolCard: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 14,
  },
  schoolIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  schoolLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    flexShrink: 0,
  },
  schoolInfo: {
    flex: 1,
    minWidth: 0,
  },
  schoolName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyCard: {
    alignItems: "center",
    padding: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },
});
