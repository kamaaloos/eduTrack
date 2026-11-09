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
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const {
    relationsLoading: loading,
    assignStudentToClass,
    assignTeacherToClass,
    linkParentToStudent,
  } = useAdminData();

  const isParentStudent = type === "parent-student";

  const resolveName = (items: SelectableItem[], id: string) =>
    items.find((item) => item.id === id)?.name?.trim() || id;

  const handleAssign = async () => {
    try {
      if (isParentStudent) {
        if (!selectedLeft || selectedStudentIds.length === 0) {
          showErrorAlert(
            t("common.error"),
            t("admin.selectParentAndStudents"),
          );
          return;
        }

        const parentId = selectedLeft;
        const toReplace: { studentId: string; existingParentId: string }[] = [];

        for (const studentId of selectedStudentIds) {
          const existingParentId = await getLinkedParentIdForStudent(studentId);
          if (existingParentId && existingParentId !== parentId) {
            toReplace.push({ studentId, existingParentId });
          }
        }

        if (toReplace.length > 0) {
          const names = toReplace
            .map((row) => resolveName(rightItems, row.studentId))
            .join(", ");
          const confirmed = await confirmAction(
            t("admin.replaceParentTitle"),
            t("admin.replaceParentManyMessage", {
              count: toReplace.length,
              students: names,
              newParent: resolveName(leftItems, parentId),
            }),
            t("admin.replaceParentConfirm"),
            t("common.cancel"),
          );
          if (!confirmed) return;
        }

        for (const studentId of selectedStudentIds) {
          await linkParentToStudent(parentId, studentId);
        }

        showSuccessAlert(
          t("common.success"),
          t("admin.parentLinkedMany", { count: selectedStudentIds.length }),
        );
        setSelectedLeft("");
        setSelectedStudentIds([]);
        await onAssignSuccess?.();
        return;
      }

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
      {isParentStudent ? (
        <Text style={styles.hint}>{t("admin.parentLinkHint")}</Text>
      ) : null}

      <Selector
        title={leftLabel}
        items={leftItems}
        selectedId={selectedLeft}
        onSelect={setSelectedLeft}
        disabled={loading}
        searchable
        searchPlaceholder={t("admin.searchParentOrName")}
        visibleLimit={isParentStudent ? 8 : 4}
        maxListHeight={isParentStudent ? 320 : 280}
      />

      {isParentStudent ? (
        <Selector
          title={rightLabel}
          items={rightItems}
          multiSelect
          selectedIds={selectedStudentIds}
          onChangeSelectedIds={setSelectedStudentIds}
          disabled={loading}
          searchable
          searchPlaceholder={t("admin.searchStudentOrName")}
          visibleLimit={8}
          maxListHeight={360}
        />
      ) : (
        <Selector
          title={rightLabel}
          items={rightItems}
          selectedId={selectedRight}
          onSelect={setSelectedRight}
          disabled={loading}
          searchable
          visibleLimit={4}
        />
      )}

      <SchoolThemeButton
        label={
          isParentStudent
            ? t("admin.linkParentToStudents", {
                count: Math.max(selectedStudentIds.length, 1),
              })
            : t("common.assign")
        }
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
