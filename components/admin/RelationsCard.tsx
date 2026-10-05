import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { SchoolThemeButton } from "../common/SchoolThemeButton";
import { useAdminData } from "../../src/context/adminDataContext";
import { showErrorAlert, showSuccessAlert } from "../../src/utils/confirmDialog";
import { platformShadow } from "../../src/utils/platformShadow";
import { innerCardBorderStyle } from "../../src/constants/innerCardBorders";
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
        showErrorAlert(
          t("common.error"),
          t("admin.selectBothFields", { left: leftLabel, right: rightLabel }),
        );
        return;
      }

      if (type === "student-class") {
        await assignStudentToClass(selectedLeft, selectedRight);
        showSuccessAlert(t("common.success"), t("admin.studentAssigned"));
      } else if (type === "teacher-class") {
        await assignTeacherToClass(selectedLeft, selectedRight);
        showSuccessAlert(t("common.success"), t("admin.teacherAssigned"));
      } else if (type === "parent-student") {
        await linkParentToStudent(selectedLeft, selectedRight);
        showSuccessAlert(t("common.success"), t("admin.parentLinked"));
      }

      setSelectedLeft("");
      setSelectedRight("");
      await onAssignSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("admin.operationFailed");
      showErrorAlert(t("common.error"), message);
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

      <SchoolThemeButton
        label={t("common.assign")}
        onPress={handleAssign}
        loading={loading}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    ...innerCardBorderStyle,
    ...platformShadow("md"),
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
});
