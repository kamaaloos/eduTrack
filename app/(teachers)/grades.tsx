import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { addDoc, collection } from "firebase/firestore";

import { ErrorBoundary } from "../../components/ErrorBoundary";
import { AuthContext } from "../../src/context/authContext";
import { useTeacherClassesContext } from "../../src/context/teacherClassesContext";
import { notifyGradePosted } from "../../src/services/notificationEvents";
import { db } from "../../src/services/firebase";
import { upsertExamResultFromGrade } from "../../src/services/examResults";
import { loadStudentsForClass } from "../../src/services/teacherStudents";

const SUBJECT_KEYS = [
  "mathematics",
  "english",
  "science",
  "history",
  "geography",
  "physics",
  "chemistry",
  "biology",
  "computerScience",
  "physicalEducation",
] as const;

interface Student {
  id: string;
  name: string;
  email: string;
}

export default function GradesScreen() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);
  const { selectedClassId } = useTeacherClassesContext();

  const subjects = useMemo(
    () =>
      SUBJECT_KEYS.map((key) => ({
        key,
        label: t(`teacher.grades.subjects.${key}`),
      })),
    [t],
  );

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [score, setScore] = useState("");

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const classId = selectedClassId || userData?.classId;
      if (!user?.uid || !classId) {
        setError(t("teacher.grades.selectClassHint"));
        setStudents([]);
        return;
      }

      const data = await loadStudentsForClass(user.uid, classId);
      setStudents(
        data.map((s) => ({
          id: s.id,
          name: (s.name as string) || t("common.unknown"),
          email: (s.email as string) || "",
        })),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("teacher.grades.loadStudentsError");
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, selectedClassId, userData?.classId, t]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const validateScore = (value: string): boolean => {
    const num = Number(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  const handleSaveGrade = async () => {
    try {
      if (!selectedStudent) {
        Alert.alert(t("common.error"), t("teacher.grades.selectStudentAlert"));
        return;
      }

      if (!selectedSubject) {
        Alert.alert(t("common.error"), t("teacher.grades.selectSubjectAlert"));
        return;
      }

      if (!score || !validateScore(score)) {
        Alert.alert(t("common.error"), t("teacher.grades.invalidScore"));
        return;
      }

      setSaving(true);
      setError(null);

      await addDoc(collection(db, "grades"), {
        studentId: selectedStudent.id,
        subject: selectedSubject,
        score: Number(score),
        teacherId: user?.uid,
        classId: selectedClassId || userData?.classId,
        createdAt: new Date(),
      });

      const classId = selectedClassId || userData?.classId;
      if (classId) {
        try {
          await upsertExamResultFromGrade({
            studentId: selectedStudent.id,
            classId,
            subject: selectedSubject,
            score: Number(score),
          });
        } catch {
          /* exam result sync is best-effort */
        }
      }

      Alert.alert(
        t("common.success"),
        t("teacher.grades.savedFor", { name: selectedStudent.name }),
      );

      void notifyGradePosted({
        classId: classId || selectedClassId || "",
        studentId: selectedStudent.id,
        studentName: selectedStudent.name || t("common.student"),
        subject: selectedSubject,
        score: Number(score),
        actorId: user?.uid ?? null,
      });

      setSelectedStudent(null);
      setSelectedSubject("");
      setScore("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("teacher.grades.saveError");
      setError(message);
      Alert.alert(t("common.error"), message);
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()),
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{t("teacher.grades.title")}</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.section}>
          <Text style={styles.label}>{t("teacher.grades.studentLabel")}</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowStudentModal(true)}
            disabled={saving}
          >
            <Text
              style={[
                styles.dropdownText,
                !selectedStudent && styles.placeholderText,
              ]}
            >
              {selectedStudent
                ? selectedStudent.name
                : t("teacher.grades.selectStudent")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("teacher.grades.subjectLabel")}</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowSubjectModal(true)}
            disabled={saving}
          >
            <Text
              style={[
                styles.dropdownText,
                !selectedSubject && styles.placeholderText,
              ]}
            >
              {selectedSubject || t("teacher.grades.selectSubject")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("teacher.grades.scoreLabel")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("teacher.grades.enterScore")}
            keyboardType="numeric"
            value={score}
            onChangeText={setScore}
            editable={!saving}
            maxLength={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSaveGrade}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>{t("teacher.grades.saveGrade")}</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={showStudentModal}
        animationType="slide"
        onRequestClose={() => setShowStudentModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t("teacher.grades.selectStudentModal")}
            </Text>
            <TouchableOpacity onPress={() => setShowStudentModal(false)}>
              <Text style={styles.closeButton}>{t("common.close")}</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder={t("teacher.grades.searchStudents")}
            value={studentSearch}
            onChangeText={setStudentSearch}
          />

          {filteredStudents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t("teacher.grades.noStudentsFound")}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredStudents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    setSelectedStudent(item);
                    setShowStudentModal(false);
                    setStudentSearch("");
                  }}
                >
                  <View>
                    <Text style={styles.listItemName}>{item.name}</Text>
                    <Text style={styles.listItemEmail}>{item.email}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>

      <Modal
        visible={showSubjectModal}
        animationType="slide"
        onRequestClose={() => setShowSubjectModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t("teacher.grades.selectSubjectModal")}
            </Text>
            <TouchableOpacity onPress={() => setShowSubjectModal(false)}>
              <Text style={styles.closeButton}>{t("common.close")}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={subjects}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.listItem,
                  selectedSubject === item.label && styles.selectedListItem,
                ]}
                onPress={() => {
                  setSelectedSubject(item.label);
                  setShowSubjectModal(false);
                }}
              >
                <Text
                  style={[
                    styles.listItemName,
                    selectedSubject === item.label && styles.selectedListItemText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 20,
    color: "#1F2937",
  },

  section: {
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#1F2937",
  },

  dropdown: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DADADA",
  },

  dropdownText: {
    fontSize: 16,
    color: "#1F2937",
  },

  placeholderText: {
    color: "#999",
  },

  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DADADA",
    fontSize: 16,
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  errorText: {
    color: "#DC2626",
    fontSize: 14,
    marginBottom: 15,
    paddingHorizontal: 10,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    marginTop: 40,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "white",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },

  closeButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },

  searchInput: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DADADA",
  },

  listItem: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  selectedListItem: {
    backgroundColor: "#EBF8FF",
  },

  listItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },

  selectedListItemText: {
    color: "#007AFF",
  },

  listItemEmail: {
    fontSize: 13,
    color: "#6B7280",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
