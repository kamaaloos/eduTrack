import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { UserData } from "../../hooks/useAdminUsers";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";
import { AdminDirectoryTableRow } from "./AdminDirectoryTableRow";

type AdminClassStudentNamesListProps = {
  students: UserData[];
  loading?: boolean;
  onSelectStudent?: (student: UserData) => void;
  onRemoveStudent?: (student: UserData) => void;
  removeDisabled?: boolean;
};

export function AdminClassStudentNamesList({
  students,
  loading = false,
  onSelectStudent,
  onRemoveStudent,
  removeDisabled = false,
}: AdminClassStudentNamesListProps) {
  const { t } = useTranslation();
  const { theme } = useSchoolTheme();
  const primary = theme.primaryColor;

  if (loading) {
    return <ActivityIndicator color={primary} style={styles.loader} />;
  }

  if (students.length === 0) {
    return <Text style={styles.empty}>{t("admin.classStudentsEmpty")}</Text>;
  }

  return (
    <View style={styles.list}>
      {students.map((student, index) => {
        const name = student.name || student.email || t("common.student");
        const rowStyle = [
          styles.row,
          index === students.length - 1 && styles.rowLast,
        ];

        return (
          <View
            key={student.id}
            style={[styles.rowWrap, index === students.length - 1 && styles.rowLast]}
          >
            <AdminDirectoryTableRow
              style={[rowStyle, styles.rowMain]}
              onPress={
                onSelectStudent ? () => onSelectStudent(student) : undefined
              }
            >
              <Text style={styles.name} numberOfLines={2}>
                {name}
              </Text>
              {onSelectStudent ? (
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              ) : null}
            </AdminDirectoryTableRow>
            {onRemoveStudent ? (
              <Pressable
                onPress={() => {
                  if (!removeDisabled) onRemoveStudent(student);
                }}
                disabled={removeDisabled}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t("admin.classRosterRemoveA11y", { name })}
                style={styles.removeBtn}
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={22}
                  color={removeDisabled ? "#CBD5E1" : "#DC2626"}
                />
              </Pressable>
            ) : null}
          </View>
        );
      })}
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
  rowWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E2E8F0",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  rowMain: {
    flex: 1,
    borderBottomWidth: 0,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  removeBtn: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
});
