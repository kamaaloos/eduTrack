import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { UserData } from "../../hooks/useAdminUsers";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";

type AdminClassStudentNamesListProps = {
  students: UserData[];
  loading?: boolean;
};

export function AdminClassStudentNamesList({
  students,
  loading = false,
}: AdminClassStudentNamesListProps) {
  const { t } = useTranslation();

  if (loading) {
    return <ActivityIndicator color="#2563EB" style={styles.loader} />;
  }

  if (students.length === 0) {
    return <Text style={styles.empty}>{t("admin.classStudentsEmpty")}</Text>;
  }

  return (
    <View style={styles.list}>
      {students.map((student, index) => (
        <View
          key={student.id}
          style={[styles.row, index === students.length - 1 && styles.rowLast]}
        >
          <Text style={styles.name} numberOfLines={2}>
            {student.name || student.email || t("common.student")}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 24 },
  empty: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 24,
  },
  list: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    backgroundColor: "#F8FAFC",
    overflow: "hidden",
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
});
