import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SuperAdminScreenHeader } from "../../components/superAdmin/SuperAdminScreenHeader";
import {
  createSchoolRecord,
  getSchoolForAdmin,
  updateSchoolRecord,
  validateSchoolInput,
  type SchoolRegistryInput,
} from "../../src/services/schoolRegistryAdmin";
import type { SchoolFirebaseConfig } from "../../src/types/school";

const EMPTY_FIREBASE: SchoolFirebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

function defaultUsageExpiryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export default function SuperAdminSchoolFormScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [active, setActive] = useState(true);
  const [usageExpiresAt, setUsageExpiresAt] = useState(defaultUsageExpiryDate());
  const [firebase, setFirebase] = useState<SchoolFirebaseConfig>(EMPTY_FIREBASE);

  useEffect(() => {
    if (!id) return;

    void (async () => {
      try {
        const school = await getSchoolForAdmin(String(id));
        if (!school) {
          Alert.alert(t("superAdmin.notFound"), t("superAdmin.schoolNotFound"));
          router.back();
          return;
        }
        setName(school.name);
        setCity(school.city ?? "");
        setActive(school.active);
        setUsageExpiresAt(school.usageExpiresAt ?? "");
        setFirebase(school.firebase);
      } catch (err) {
        Alert.alert(
          t("common.error"),
          err instanceof Error ? err.message : t("superAdmin.loadSchoolFailed"),
        );
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id, t]);

  const updateFirebaseField = (field: keyof SchoolFirebaseConfig, value: string) => {
    setFirebase((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const input: SchoolRegistryInput = {
      name,
      city,
      active,
      usageExpiresAt,
      firebase,
    };

    const validationError = validateSchoolInput(input);
    if (validationError) {
      Alert.alert(t("superAdmin.validation"), validationError);
      return;
    }

    setSaving(true);
    try {
      if (isEdit && id) {
        await updateSchoolRecord(String(id), input);
      } else {
        await createSchoolRecord(input);
      }
      router.back();
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error ? err.message : t("superAdmin.saveSchoolFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  const firebaseFields = [
    ["apiKey", "superAdmin.apiKey"],
    ["authDomain", "superAdmin.authDomain"],
    ["projectId", "superAdmin.projectId"],
    ["storageBucket", "superAdmin.storageBucket"],
    ["messagingSenderId", "superAdmin.messagingSenderId"],
    ["appId", "superAdmin.appId"],
  ] as const;

  if (loading) {
    return (
      <View style={styles.screen}>
        <SuperAdminScreenHeader
          title={isEdit ? t("superAdmin.editSchool") : t("superAdmin.addSchool")}
          showBack
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <SuperAdminScreenHeader
        title={isEdit ? t("superAdmin.editSchool") : t("superAdmin.addSchool")}
        subtitle={t("superAdmin.schoolFormSubtitle")}
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>{t("superAdmin.schoolDetails")}</Text>
        <View style={styles.card}>
          <Text style={styles.label}>{t("superAdmin.schoolNameRequired")}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="MayleSoft Academy"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>{t("superAdmin.city")}</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Addis Ababa"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>{t("superAdmin.usageExpiresAt")}</Text>
          <TextInput
            style={styles.input}
            value={usageExpiresAt}
            onChangeText={setUsageExpiresAt}
            placeholder={t("superAdmin.usageExpiresAtPlaceholder")}
            placeholderTextColor="#94A3B8"
          />
          <Text style={styles.hint}>{t("superAdmin.usageExpiresAtHint")}</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchTextBlock}>
              <Text style={styles.labelInline}>{t("superAdmin.activeInPicker")}</Text>
              <Text style={styles.hint}>{t("superAdmin.activeInPickerHint")}</Text>
            </View>
            <Switch
              value={active}
              onValueChange={setActive}
              trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
              thumbColor={active ? "#1E3A8A" : "#F8FAFC"}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t("superAdmin.firebaseConfigSection")}</Text>
        <View style={styles.card}>
          <Text style={styles.hintBlock}>{t("superAdmin.firebaseConfigHint")}</Text>

          {firebaseFields.map(([field, labelKey]) => (
            <View key={field}>
              <Text style={styles.label}>{t(labelKey)}</Text>
              <TextInput
                style={styles.input}
                value={firebase[field]}
                onChangeText={(value) => updateFirebaseField(field, value)}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder={t(labelKey)}
                placeholderTextColor="#94A3B8"
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={() => void handleSave()}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {isEdit ? t("superAdmin.saveChanges") : t("superAdmin.registerSchool")}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    marginTop: 4,
  },
  labelInline: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  switchTextBlock: {
    flex: 1,
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#94A3B8",
  },
  hintBlock: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
    marginBottom: 12,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1E3A8A",
    borderRadius: 14,
    paddingVertical: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
