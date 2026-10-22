import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { SchoolThemeButton } from "../common/SchoolThemeButton";
import { useAdminData } from "../../src/context/adminDataContext";
import { getLinkedParentIdForStudent } from "../../src/services/parentStudentLinks";
import {
  confirmAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";
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

  const resolveName = (items: SelectableItem[], id: string) =>
    items.find((item) => item.id === id)?.name?.trim() || id;

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
        const parentId = selectedLeft;
        const studentId = selectedRight;
        const existingParentId = await getLinkedParentIdForStudent(studentId);

        if (existingParentId && existingParentId !== parentId) {
          const studentName = resolveName(rightItems, studentId);
          const newParentName = resolveName(leftItems, parentId);
          const currentParentName = resolveName(leftItems, existingParentId);
          const confirmed = await confirmAction(
            t("admin.replaceParentTitle"),
            t("admin.replaceParentMessage", {
              student: studentName,
              currentParent: currentParentName,
              newParent: newParentName,
            }),
            t("admin.replaceParentConfirm"),
            t("common.cancel"),
          );
          if (!confirmed) return;
        }

        await linkParentToStudent(parentId, studentId);
        showSuccessAlert(
          t("common.success"),
          existingParentId && existingParentId !== parentId
            ? t("admin.parentReplaced")
            : t("admin.parentLinked"),
        );
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
      {type === "parent-student" ? (
        <Text style={styles.hint}>{t("admin.parentLinkHint")}</Text>
      ) : null}

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
  hint: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginTop: -6,
    marginBottom: 14,
  },
});
