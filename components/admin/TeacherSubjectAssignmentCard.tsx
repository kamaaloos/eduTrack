import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAdminData } from "../../src/context/adminDataContext";
import type { TeacherSubjectLink } from "../../hooks/useAdminRelations";
import { Selector } from "./Selector";

export function TeacherSubjectAssignmentCard() {
  const { t } = useTranslation();
  const {
    teachers,
    classes,
    relationsLoading,
    assignTeacherToSubject,
    loadTeacherSubjectAssignments,
    removeTeacherSubjectAssignment,
    refreshAll,
  } = useAdminData();

  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [assignments, setAssignments] = useState<TeacherSubjectLink[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const classSubjects = useMemo(() => {
    const cls = classes.find((c) => c.id === selectedClassId);
    const list = cls?.subjects;
    return Array.isArray(list) ? list : [];
  }, [classes, selectedClassId]);

  const subjectItems = useMemo(
    () => classSubjects.map((s) => ({ id: s, name: s })),
    [classSubjects],
  );

  const loadAssignments = useCallback(async () => {
    setLoadingList(true);
    try {
      const rows = await loadTeacherSubjectAssignments();
      setAssignments(rows);
    } catch (err) {
      console.error("Load teacher subject assignments:", err);
    } finally {
      setLoadingList(false);
    }
  }, [loadTeacherSubjectAssignments]);

  useFocusEffect(
    useCallback(() => {
      void loadAssignments();
    }, [loadAssignments]),
  );

  useEffect(() => {
    setSelectedSubject("");
  }, [selectedClassId]);

  const resolveTeacherName = (id: string) =>
    teachers.find((item) => item.id === id)?.name || id.slice(0, 8);
  const resolveClassName = (id: string) =>
    classes.find((item) => item.id === id)?.name || id.slice(0, 8);
  const subjectLabel = (row: TeacherSubjectLink) =>
    `${row.subject} · ${resolveClassName(row.classId)}`;

  const handleAssign = async () => {
    if (!selectedTeacherId || !selectedClassId || !selectedSubject) {
      Alert.alert(t("common.error"), t("admin.teacherSubjectMissing"));
      return;
    }

    try {
      await assignTeacherToSubject(
        selectedTeacherId,
        selectedClassId,
        selectedSubject,
      );
      Alert.alert(t("common.success"), t("admin.teacherSubjectAssigned"));
      setSelectedSubject("");
      await loadAssignments();
      await refreshAll();
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.assignmentFailed"),
      );
    }
  };

  const handleRemove = (row: TeacherSubjectLink) => {
    Alert.alert(
      t("admin.removeAssignmentTitle"),
      t("admin.removeAssignmentMessage", {
        teacher: resolveTeacherName(row.teacherId),
        subject: subjectLabel(row),
      }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.remove"),
          style: "destructive",
          onPress: async () => {
            try {
              await removeTeacherSubjectAssignment(row.id);
              await loadAssignments();
            } catch (err) {
              Alert.alert(
                t("common.error"),
                err instanceof Error ? err.message : t("admin.couldNotRemove"),
              );
            }
          },
        },
      ],
    );
  };

  const busy = relationsLoading || loadingList;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t("admin.teacherSubjectTitle")}</Text>
      <Text style={styles.hint}>{t("admin.teacherSubjectHint")}</Text>

      <Selector
        title={t("common.teacher")}
        items={teachers.map((item) => ({ id: item.id, name: item.name }))}
        selectedId={selectedTeacherId}
        onSelect={setSelectedTeacherId}
        disabled={busy}
      />

      <Selector
        title={t("common.class")}
        items={classes.map((item) => ({ id: item.id, name: item.name }))}
        selectedId={selectedClassId}
        onSelect={setSelectedClassId}
        disabled={busy}
      />

      {selectedClassId && classSubjects.length === 0 ? (
        <Text style={styles.warn}>{t("admin.addSubjectsFirst")}</Text>
      ) : (
        <Selector
          title={t("common.subject")}
          items={subjectItems}
          selectedId={selectedSubject}
          onSelect={setSelectedSubject}
          disabled={busy || classSubjects.length === 0}
        />
      )}

      <TouchableOpacity
        style={[styles.button, busy && styles.buttonDisabled]}
        onPress={handleAssign}
        disabled={busy}
      >
        {relationsLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>{t("common.assign")}</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.listTitle}>{t("admin.currentAssignments")}</Text>
      {loadingList ? (
        <ActivityIndicator style={{ marginVertical: 16 }} />
      ) : assignments.length === 0 ? (
        <Text style={styles.emptyList}>
          {t("admin.noTeacherSubjectAssignments")}
        </Text>
      ) : (
        <ScrollView style={styles.listScroll} nestedScrollEnabled>
          {assignments.map((row) => (
            <View key={row.id} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowMain}>
                  {resolveTeacherName(row.teacherId)}
                </Text>
                <Text style={styles.rowSub}>{subjectLabel(row)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemove(row)}
                disabled={busy}
                hitSlop={8}
              >
                <Text style={styles.removeText}>{t("common.remove")}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

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
  sectionTitle: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  hint: { fontSize: 13, color: "#64748B", lineHeight: 18, marginBottom: 12 },
  warn: {
    fontSize: 13,
    color: "#B45309",
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
  listTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyList: { color: "#94A3B8", fontSize: 14 },
  listScroll: { maxHeight: 220 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 12,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowMain: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  rowSub: { fontSize: 13, color: "#64748B", marginTop: 2 },
  removeText: { color: "#DC2626", fontWeight: "600", fontSize: 13 },
});
