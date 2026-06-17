import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Platform,
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
  /** Border, padding, and spacing for the whole field (not just the text). */
  inputStyle?: StyleProp<ViewStyle>;
};

type FlatFieldStyle = ViewStyle & Pick<TextStyle, "fontSize" | "color">;

function splitFieldAndTextStyles(
  ...styleList: (StyleProp<ViewStyle> | undefined)[]
): { fieldStyle: ViewStyle; textStyle: TextStyle } {
  const flat = (StyleSheet.flatten(styleList) ?? {}) as FlatFieldStyle;
  const {
    padding,
    paddingHorizontal,
    paddingVertical,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    fontSize,
    color,
    ...box
  } = flat;

  const padH =
    paddingHorizontal ?? (typeof padding === "number" ? padding : undefined) ?? 12;
  const padV =
    paddingVertical ?? (typeof padding === "number" ? padding : undefined) ?? 12;

  return {
    fieldStyle: box,
    textStyle: {
      paddingTop: paddingTop ?? padV,
      paddingBottom: paddingBottom ?? padV,
      paddingLeft: paddingLeft ?? padH,
      paddingRight: paddingRight ?? 8,
      ...(fontSize != null ? { fontSize } : null),
      ...(color != null ? { color } : null),
    },
  };
}

export function PasswordInput({
  containerStyle,
  inputStyle,
  style,
  editable = true,
  placeholderTextColor = "#9CA3AF",
  ...rest
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const { fieldStyle, textStyle } = splitFieldAndTextStyles(
    styles.field,
    containerStyle,
    inputStyle,
    style,
  );

  return (
    <View style={fieldStyle}>
      <TextInput
        {...rest}
        editable={editable}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={!visible}
        style={[styles.textInput, textStyle]}
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
          size={18}
          color={editable ? "#1D4ED8" : "#9CA3AF"}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    width: "100%",
    maxWidth: "100%",
    ...(Platform.OS === "web"
      ? ({ boxSizing: "border-box" } as object)
      : null),
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "transparent",
    ...(Platform.OS === "web"
      ? ({ outlineStyle: "none" } as object)
      : null),
  },
  visibilityToggle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 6,
    flexShrink: 0,
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
