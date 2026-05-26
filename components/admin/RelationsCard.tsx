import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAdminData } from "../../src/context/adminDataContext";
import { SelectableItem, Selector } from "./Selector";

interface RelationsCardProps {
  title: string;
  type: "student-class" | "teacher-class" | "parent-student";
  leftItems: SelectableItem[];
  rightItems: SelectableItem[];
  leftLabel: string;
  rightLabel: string;
  onAssignSuccess?: () => void | Promise<void>;
}

export const RelationsCard: React.FC<RelationsCardProps> = ({
  title,
  type,
  leftItems,
  rightItems,
  leftLabel,
  rightLabel,
  onAssignSuccess,
}) => {
  const { t } = useTranslation();
  const [selectedLeft, setSelectedLeft] = useState("");
  const [selectedRight, setSelectedRight] = useState("");
  const {
    relationsLoading: loading,
    assignStudentToClass,
    assignTeacherToClass,
    linkParentToStudent,
  } = useAdminData();

  const handleAssign = async () => {
    try {
      if (!selectedLeft || !selectedRight) {
        Alert.alert(
          t("common.error"),
          t("admin.selectBothFields", { left: leftLabel, right: rightLabel }),
        );
        return;
      }

      if (type === "student-class") {
        await assignStudentToClass(selectedLeft, selectedRight);
        Alert.alert(t("common.success"), t("admin.studentAssigned"));
      } else if (type === "teacher-class") {
        await assignTeacherToClass(selectedLeft, selectedRight);
        Alert.alert(t("common.success"), t("admin.teacherAssigned"));
      } else if (type === "parent-student") {
        await linkParentToStudent(selectedLeft, selectedRight);
        Alert.alert(t("common.success"), t("admin.parentLinked"));
      }

      setSelectedLeft("");
      setSelectedRight("");
      await onAssignSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("admin.operationFailed");
      Alert.alert(t("common.error"), message);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <Selector
        title={leftLabel}
        items={leftItems}
        selectedId={selectedLeft}
        onSelect={setSelectedLeft}
        disabled={loading}
      />

      <Selector
        title={rightLabel}
        items={rightItems}
        selectedId={selectedRight}
        onSelect={setSelectedRight}
        disabled={loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleAssign}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>{t("common.assign")}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
