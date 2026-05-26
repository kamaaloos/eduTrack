import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { adminAcademicStyles as styles } from "./adminAcademicStyles";

export function AdminAcademicCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function AdminAcademicButton({
  onPress,
  label,
}: {
  onPress: () => void;
  label: string;
}) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}
