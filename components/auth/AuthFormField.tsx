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
  /** Border / icon / hover shadow accent (defaults to app blue). */
  primaryColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  fieldStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function AuthFormField({
  label,
  icon,
  isPassword = false,
  primaryColor = "#2563EB",
  containerStyle,
  fieldStyle,
  inputStyle,
  editable = true,
  placeholderTextColor = "#9CA3AF",
  ...rest
}: AuthFormFieldProps) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const active = editable && (focused || hovered);
  const iconColor = editable ? (active ? primaryColor : "#64748B") : "#9CA3AF";

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        focusable={false}
        onHoverIn={() => {
          if (editable) setHovered(true);
        }}
        onHoverOut={() => setHovered(false)}
        style={[
          styles.field,
          active && {
            borderColor: primaryColor,
            backgroundColor: "#FFFFFF",
            ...(Platform.OS === "web"
              ? ({
                  boxShadow: `0 0 0 3px ${primaryColor}22, 0 10px 24px ${primaryColor}33`,
                } as object)
              : {
                  shadowColor: primaryColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.18,
                  shadowRadius: 10,
                  elevation: 3,
                }),
          },
          !editable && styles.fieldDisabled,
          fieldStyle,
          Platform.OS === "web"
            ? ({
                transitionProperty: "border-color, box-shadow, background-color",
                transitionDuration: "160ms",
                transitionTimingFunction: "ease-out",
              } as object)
            : null,
        ]}
      >
        <View style={styles.leadingIcon}>
          <Ionicons name={icon} size={20} color={iconColor} />
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
              {
                backgroundColor: `${primaryColor}14`,
                borderColor: `${primaryColor}55`,
              },
              pressed && { opacity: 0.85 },
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
              color={editable ? primaryColor : "#9CA3AF"}
            />
          </Pressable>
        ) : null}
      </Pressable>
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
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  visibilityToggleDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
});
