import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { SchoolThemeButton } from "../common/SchoolThemeButton";
import { PasswordInput } from "../PasswordInput";
import { UserRole } from "../../hooks/useAdminUsers";
import { RoleSelectPicker } from "./RoleSelectPicker";
import { useAdminData } from "../../src/context/adminDataContext";
import { showErrorAlert, showSuccessAlert } from "../../src/utils/confirmDialog";
import { platformShadow } from "../../src/utils/platformShadow";
import { innerCardBorderStyle } from "../../src/constants/innerCardBorders";

const ROLES: UserRole[] = [
  "student",
  "teacher",
  "parent",
  "admin",
  "secretary",
];

interface UserCreationCardProps {
  onUserCreated?: () => void | Promise<void>;
}

export const UserCreationCard: React.FC<UserCreationCardProps> = ({
  onUserCreated,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(
    () => t("admin.defaultPassword"),
  );
  const [role, setRole] = useState<UserRole>("student");

  const { usersLoading: loading, createUser } = useAdminData();

  const handleCreateUser = async () => {
    try {
      await createUser({ name, email, password, role, phone: phone.trim() });
      await onUserCreated?.();
      showSuccessAlert(
        t("common.success"),
        t("admin.userCreatedSuccess", {
          role: t(`common.${role}`),
        }),
      );
      setName("");
      setEmail("");
      setPhone("");
      setPassword(t("admin.defaultPassword"));
      setRole("student");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("admin.createUserFailed");
      showErrorAlert(t("common.error"), message);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t("admin.createUser")}</Text>

      <TextInput
        placeholder={t("admin.fullNamePlaceholder")}
        value={name}
        onChangeText={setName}
        style={styles.input}
        editable={!loading}
      />

      <TextInput
        placeholder={t("common.email")}
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <TextInput
        placeholder={t("admin.phonePlaceholder")}
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
        editable={!loading}
      />

      <PasswordInput
        placeholder={t("admin.passwordMinPlaceholder")}
        value={password}
        onChangeText={setPassword}
        inputStyle={styles.input}
        editable={!loading}
      />
      <Text style={styles.hint}>{t("admin.tempPasswordHint")}</Text>

      <RoleSelectPicker
        label={t("admin.selectRole")}
        value={role}
        roles={ROLES}
        onChange={setRole}
        disabled={loading}
      />

      <SchoolThemeButton
        label={t("admin.createUser")}
        onPress={handleCreateUser}
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
    ...(Platform.OS === "web"
      ? ({ boxSizing: "border-box" } as object)
      : null),
  },
  hint: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginTop: -4,
    marginBottom: 12,
  },
});
