import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SchoolThemeButton } from "../common/SchoolThemeButton";
import { useAdminData } from "../../src/context/adminDataContext";
import { showErrorAlert, showSuccessAlert } from "../../src/utils/confirmDialog";
import { platformShadow } from "../../src/utils/platformShadow";
import { innerCardBorderStyle } from "../../src/constants/innerCardBorders";

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
      showSuccessAlert(t("common.success"), t("admin.classCreated"));
      setClassName("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("admin.createClassFailed");
      showErrorAlert(t("common.error"), message);
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

      <SchoolThemeButton
        label={t("admin.createClass")}
        onPress={handleCreateClass}
        loading={loading}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    ...innerCardBorderStyle,
    ...platformShadow("md"),
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
});
