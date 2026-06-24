import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

type AuthFormFieldProps = TextInputProps & {
  label?: string;
  icon: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  fieldStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function AuthFormField({
  label,
  icon,
  isPassword = false,
  containerStyle,
  fieldStyle,
  inputStyle,
  editable = true,
  placeholderTextColor = "#9CA3AF",
  ...rest
}: AuthFormFieldProps) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          !editable && styles.fieldDisabled,
          fieldStyle,
        ]}
      >
        <View style={styles.leadingIcon}>
          <Ionicons
            name={icon}
            size={20}
            color={editable ? "#2563EB" : "#9CA3AF"}
          />
        </View>
        <TextInput
          {...rest}
          editable={editable}
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={isPassword && !visible}
          onFocus={(event) => {
            setFocused(true);
            rest.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            rest.onBlur?.(event);
          }}
          style={[styles.input, inputStyle]}
        />
        {isPassword ? (
          <Pressable
            style={({ pressed }) => [
              styles.visibilityToggle,
              pressed && styles.visibilityTogglePressed,
              editable === false && styles.visibilityToggleDisabled,
            ]}
            onPress={() => setVisible((v) => !v)}
            disabled={editable === false}
            accessibilityRole="button"
            accessibilityLabel={visible ? "Hide password" : "Show password"}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons
              name={visible ? "eye-off" : "eye"}
              size={20}
              color={editable ? "#1D4ED8" : "#9CA3AF"}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    minHeight: 54,
  },
  fieldFocused: {
    borderColor: "#2563EB",
    backgroundColor: "#FFFFFF",
  },
  fieldDisabled: {
    opacity: 0.65,
  },
  leadingIcon: {
    paddingLeft: 14,
    paddingRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 14,
    paddingRight: 12,
    minWidth: 0,
    ...(Platform.OS === "web"
      ? ({
          outlineStyle: "none",
          borderWidth: 0,
          backgroundColor: "transparent",
          boxShadow: "none",
        } as object)
      : null),
  },
  visibilityToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
  },
  visibilityTogglePressed: {
    backgroundColor: "#DBEAFE",
  },
  visibilityToggleDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
});
