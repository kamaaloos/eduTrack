import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import type { UserRole } from "../../hooks/useAdminUsers";
import { OptionPickerModal } from "../messaging/OptionPickerModal";

type RoleSelectPickerProps = {
  value: UserRole;
  roles: UserRole[];
  onChange: (role: UserRole) => void;
  disabled?: boolean;
  label?: string;
};

export function RoleSelectPicker({
  value,
  roles,
  onChange,
  disabled = false,
  label,
}: RoleSelectPickerProps) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const options = useMemo(
    () =>
      roles.map((role) => ({
        value: role,
        label: t(`common.${role}`),
      })),
    [roles, t],
  );

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label ?? value;

  if (Platform.OS === "web") {
    return (
      <View style={styles.root}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <Pressable
          style={[styles.field, disabled && styles.fieldDisabled]}
          onPress={() => !disabled && setModalOpen(true)}
          disabled={disabled}
        >
          <Text style={styles.fieldText}>{selectedLabel}</Text>
          <Ionicons name="chevron-down" size={18} color="#64748B" />
        </Pressable>
        <OptionPickerModal
          visible={modalOpen}
          title={label ?? t("admin.selectRole")}
          options={options}
          selectedValue={value}
          onSelect={(next) => onChange(next as UserRole)}
          onClose={() => setModalOpen(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.nativePickerWrap, disabled && styles.fieldDisabled]}>
        <Picker
          enabled={!disabled}
          selectedValue={value}
          onValueChange={(itemValue) => onChange(itemValue as UserRole)}
          style={styles.nativePicker}
        >
          {options.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 10,
    fontWeight: "600",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "white",
  },
  fieldDisabled: {
    opacity: 0.6,
  },
  fieldText: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },
  nativePickerWrap: {
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "white",
  },
  nativePicker: {
    width: "100%",
  },
});
