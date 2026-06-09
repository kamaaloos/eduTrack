import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SelectList } from "../teachers/SelectChips";
import type { SchoolRecord } from "../../src/types/school";
import {
  cityLabel,
  countryLabel,
  getCityOptions,
  getCountryOptions,
  getSchoolsInLocation,
} from "../../src/utils/schoolLocationFilters";

type SelectSchoolLocationPickerProps = {
  schools: SchoolRecord[];
  connecting: boolean;
  onSelectSchool: (school: SchoolRecord) => void;
};

export function SelectSchoolLocationPicker({
  schools,
  connecting,
  onSelectSchool,
}: SelectSchoolLocationPickerProps) {
  const { t } = useTranslation();
  const [countryKey, setCountryKey] = useState("");
  const [cityKey, setCityKey] = useState("");

  const unspecifiedCountry = t("selectSchool.unspecifiedCountry");
  const unspecifiedCity = t("selectSchool.unspecifiedCity");

  const countryOptions = useMemo(
    () => getCountryOptions(schools, unspecifiedCountry),
    [schools, unspecifiedCountry],
  );

  const cityOptions = useMemo(
    () =>
      countryKey
        ? getCityOptions(schools, countryKey, unspecifiedCity)
        : [],
    [schools, countryKey, unspecifiedCity],
  );

  const schoolsInCity = useMemo(
    () =>
      countryKey && cityKey
        ? getSchoolsInLocation(schools, countryKey, cityKey)
        : [],
    [schools, countryKey, cityKey],
  );

  const step = !countryKey ? "country" : !cityKey ? "city" : "schools";

  const handleBackStep = () => {
    if (step === "schools") {
      setCityKey("");
      return;
    }
    if (step === "city") {
      setCountryKey("");
    }
  };

  const renderSchoolCard = (item: SchoolRecord) => (
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
  );

  return (
    <View style={styles.root}>
      {step !== "country" ? (
        <TouchableOpacity
          style={styles.backStep}
          onPress={handleBackStep}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={16} color="#475569" />
          <Text style={styles.backStepText}>
            {step === "schools"
              ? t("selectSchool.changeCity")
              : t("selectSchool.changeCountry")}
          </Text>
        </TouchableOpacity>
      ) : null}

      {countryKey ? (
        <Text style={styles.breadcrumb}>
          {countryLabel(countryKey, unspecifiedCountry)}
          {cityKey
            ? ` · ${cityLabel(cityKey, unspecifiedCity)}`
            : ""}
        </Text>
      ) : null}

      {step === "country" ? (
        <>
          <Text style={styles.stepTitle}>{t("selectSchool.pickCountry")}</Text>
          <SelectList
            options={countryOptions}
            selectedValue={countryKey}
            onSelect={(value) => {
              setCountryKey(value);
              setCityKey("");
            }}
            emptyMessage={t("selectSchool.empty")}
          />
        </>
      ) : null}

      {step === "city" ? (
        <>
          <Text style={styles.stepTitle}>{t("selectSchool.pickCity")}</Text>
          {cityOptions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="location-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyText}>
                {t("selectSchool.noCitiesInCountry")}
              </Text>
            </View>
          ) : (
            <SelectList
              options={cityOptions}
              selectedValue={cityKey}
              onSelect={setCityKey}
              emptyMessage={t("selectSchool.noCitiesInCountry")}
            />
          )}
        </>
      ) : null}

      {step === "schools" ? (
        <>
          <Text style={styles.stepTitle}>{t("selectSchool.pickSchool")}</Text>
          {schoolsInCity.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="school-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyText}>
                {t("selectSchool.noSchoolsInCity")}
              </Text>
            </View>
          ) : (
            <View style={styles.schoolList}>
              {schoolsInCity.map(renderSchoolCard)}
            </View>
          )}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    gap: 8,
  },
  backStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    marginBottom: 4,
  },
  backStepText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
  breadcrumb: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
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
    padding: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },
});
