import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

type PasswordInputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function PasswordInput({
  containerStyle,
  inputStyle,
  style,
  editable = true,
  placeholderTextColor = "#9CA3AF",
  ...rest
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.wrap, containerStyle]}>
      <TextInput
        {...rest}
        editable={editable}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={!visible}
        style={[inputStyle, style, styles.inputPadding]}
      />
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    justifyContent: "center",
  },
  inputPadding: {
    paddingRight: 52,
  },
  visibilityToggle: {
    position: "absolute",
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
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
