import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { getInitials } from "../../src/utils/userAvatar";

type UserAvatarProps = {
  name?: string | null;
  email?: string | null;
  photoURL?: string | null;
  size?: number;
  style?: ViewStyle;
  textColor?: string;
  backgroundColor?: string;
};

export function UserAvatar({
  name,
  email,
  photoURL,
  size = 60,
  style,
  textColor = "#1E40AF",
  backgroundColor = "#FFFFFF",
}: UserAvatarProps) {
  const radius = size / 2;
  const initials = getInitials(name, email);
  const fontSize = Math.max(14, Math.round(size * 0.38));

  if (photoURL) {
    return (
      <Image
        source={{ uri: photoURL }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor,
          },
          style,
        ]}
        contentFit="cover"
        accessibilityLabel={name || email || initials}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { color: textColor, fontSize }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontWeight: "700",
  },
});
