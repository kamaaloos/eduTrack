import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { parsePhotoURL } from "../../src/utils/userAvatar";

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
  const resolvedPhotoURL = parsePhotoURL(photoURL);
  const label = name?.trim() || email?.trim() || undefined;
  const iconSize = Math.max(18, Math.round(size * 0.45));

  if (resolvedPhotoURL) {
    return (
      <Image
        source={{ uri: resolvedPhotoURL }}
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
        accessibilityLabel={label}
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
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      <Ionicons name="person" size={iconSize} color={textColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});
