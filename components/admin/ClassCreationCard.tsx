import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAdminData } from "../../src/context/adminDataContext";

interface ClassCreationCardProps {
  onClassCreated?: () => void | Promise<void>;
}

export const ClassCreationCard: React.FC<ClassCreationCardProps> = ({
  onClassCreated,
}) => {
  const { t } = useTranslation();
  const [className, setClassName] = useState("");
  const { classesLoading: loading, createClass } = useAdminData();

  const handleCreateClass = async () => {
    try {
      await createClass(className);
      await onClassCreated?.();
      Alert.alert(t("common.success"), t("admin.classCreated"));
      setClassName("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("admin.createClassFailed");
      Alert.alert(t("common.error"), message);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t("admin.createClass")}</Text>

      <TextInput
        placeholder={t("admin.classNamePlaceholder")}
        value={className}
        onChangeText={setClassName}
        style={styles.input}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreateClass}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>{t("admin.createClass")}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
