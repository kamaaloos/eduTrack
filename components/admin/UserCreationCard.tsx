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
import { PasswordInput } from "../PasswordInput";
import { UserRole } from "../../hooks/useAdminUsers";
import { useAdminData } from "../../src/context/adminDataContext";

const ROLES: UserRole[] = ["student", "teacher", "parent", "admin"];

interface UserCreationCardProps {
  onUserCreated?: () => void | Promise<void>;
}

export const UserCreationCard: React.FC<UserCreationCardProps> = ({
  onUserCreated,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(
    () => t("admin.defaultPassword"),
  );
  const [role, setRole] = useState<UserRole>("student");

  const { usersLoading: loading, createUser } = useAdminData();

  const handleCreateUser = async () => {
    try {
      await createUser({ name, email, password, role });
      await onUserCreated?.();
      Alert.alert(
        t("common.success"),
        t("admin.userCreatedSuccess", {
          role: t(`common.${role}`),
        }),
      );
      setName("");
      setEmail("");
      setPassword(t("admin.defaultPassword"));
      setRole("student");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("admin.createUserFailed");
      Alert.alert(t("common.error"), message);
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

      <PasswordInput
        placeholder={t("admin.passwordMinPlaceholder")}
        value={password}
        onChangeText={setPassword}
        inputStyle={styles.input}
        editable={!loading}
      />
      <Text style={styles.hint}>{t("admin.tempPasswordHint")}</Text>

      <Text style={styles.label}>{t("admin.selectRole")}</Text>

      <View style={styles.roleContainer}>
        {ROLES.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.roleButton, role === item && styles.selectedRole]}
            onPress={() => setRole(item)}
            disabled={loading}
          >
            <Text
              style={{
                color: role === item ? "white" : "black",
                fontWeight: "600",
              }}
            >
              {t(`common.${item}`).toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreateUser}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>{t("admin.createUser")}</Text>
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
  hint: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginTop: -4,
    marginBottom: 12,
  },
  label: {
    marginBottom: 10,
    fontWeight: "600",
  },
  roleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  roleButton: {
    borderWidth: 1,
    borderColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  selectedRole: {
    backgroundColor: "#007AFF",
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
