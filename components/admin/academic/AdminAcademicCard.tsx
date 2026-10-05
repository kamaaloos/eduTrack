import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { SchoolThemeButton } from "../../common/SchoolThemeButton";
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
  return <SchoolThemeButton label={label} onPress={onPress} />;
}
