import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAdminData } from "../../src/context/adminDataContext";
import { Selector } from "./Selector";

export function ClassSubjectsCard() {
  const { t } = useTranslation();
  const { classes, classesLoading, updateClassSubjects, refreshAll } =
    useAdminData();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [localSubjects, setLocalSubjects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [classes, selectedClassId],
  );

  const serverSubjectsKey = useMemo(() => {
    const list = selectedClass?.subjects;
    if (!Array.isArray(list)) return "";
    return list.join("\u0001");
  }, [selectedClass?.subjects]);

  useEffect(() => {
    if (!selectedClassId) {
      setLocalSubjects([]);
      return;
    }
    if (!classes.some((c) => c.id === selectedClassId)) return;

    const list = selectedClass?.subjects;
    setLocalSubjects(Array.isArray(list) ? [...list] : []);
  }, [selectedClassId, serverSubjectsKey, classes, selectedClass?.subjects]);

  const persistSubjects = async (nextSubjects: string[]) => {
    if (!selectedClassId) {
      Alert.alert(t("common.error"), t("admin.selectClassFirst"));
      return;
    }
    setSaving(true);
    try {
      await updateClassSubjects(selectedClassId, nextSubjects);
      await refreshAll();
      setLocalSubjects(nextSubjects);
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.couldNotSaveSubjects"),
      );
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const addSubject = async () => {
    const trimmed = newSubject.trim();
    if (!trimmed) return;
    if (!selectedClassId) {
      Alert.alert(t("common.error"), t("admin.selectClassFirst"));
      return;
    }
    const exists = localSubjects.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      Alert.alert(t("admin.duplicateSubject"), t("admin.subjectAlreadyInList"));
      return;
    }
    const next = [...localSubjects, trimmed];
    setNewSubject("");
    setLocalSubjects(next);
    try {
      await persistSubjects(next);
    } catch {
      // Error alert shown in persistSubjects
    }
  };

  const removeSubject = async (subject: string) => {
    const next = localSubjects.filter((s) => s !== subject);
    try {
      await persistSubjects(next);
    } catch {
      // Error alert shown in persistSubjects
    }
  };

  const saveSubjects = async () => {
    try {
      await persistSubjects(localSubjects);
      Alert.alert(t("common.saved"), t("admin.classSubjectsUpdated"));
    } catch {
      // Error alert shown in persistSubjects
    }
  };

  const busy = classesLoading || saving;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t("admin.classSubjectsTitle")}</Text>
      <Text style={styles.hint}>{t("admin.classSubjectsHint")}</Text>

      <Selector
        title={t("common.class")}
        items={classes.map((c) => ({ id: c.id, name: c.name }))}
        selectedId={selectedClassId}
        onSelect={setSelectedClassId}
        disabled={busy}
      />

      {selectedClassId ? (
        <>
          <View style={styles.addRow}>
            <TextInput
              placeholder={t("admin.subjectNamePlaceholder")}
              value={newSubject}
              onChangeText={setNewSubject}
              style={styles.input}
              editable={!busy}
              onSubmitEditing={() => void addSubject()}
            />
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => void addSubject()}
              disabled={busy}
            >
              <Text style={styles.addBtnText}>{t("common.add")}</Text>
            </TouchableOpacity>
          </View>

          {localSubjects.length === 0 ? (
            <Text style={styles.empty}>{t("admin.noSubjectsForClass")}</Text>
          ) : (
            <View style={styles.chipWrap}>
              {localSubjects.map((subject) => (
                <View key={subject} style={styles.chip}>
                  <Text style={styles.chipText}>{subject}</Text>
                  <TouchableOpacity
                    onPress={() => void removeSubject(subject)}
                    disabled={busy}
                    hitSlop={8}
                  >
                    <Text style={styles.chipRemove}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, busy && styles.buttonDisabled]}
            onPress={saveSubjects}
            disabled={busy}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>{t("admin.saveSubjects")}</Text>
            )}
          </TouchableOpacity>
        </>
      ) : null}
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
  addRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  addBtn: {
    backgroundColor: "#0F766E",
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  addBtnText: { color: "#FFFFFF", fontWeight: "700" },
  empty: { color: "#94A3B8", fontSize: 14, marginBottom: 12 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  chipText: { fontSize: 14, fontWeight: "600", color: "#065F46" },
  chipRemove: { fontSize: 18, color: "#047857", fontWeight: "700" },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
});
