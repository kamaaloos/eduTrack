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

import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

import { ErrorBoundary } from "../../components/ErrorBoundary";
import { AuthContext } from "../../src/context/authContext";
import { db } from "../../src/services/firebase";

interface Class {
  id: string;
  name: string;
}

export default function HomeworkScreen() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);

  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [showClassModal, setShowClassModal] = useState(false);
  const [classSearch, setClassSearch] = useState("");

  const loadClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.uid) {
        setError(t("teacher.homework.notAuthenticated"));
        setClasses([]);
        return;
      }

      const q = query(
        collection(db, "teacherClasses"),
        where("teacherId", "==", user.uid),
      );

      const snapshot = await getDocs(q);
      const teacherClassIds = snapshot.docs.map((doc) => doc.data().classId);

      if (teacherClassIds.length === 0) {
        setError(t("teacher.homework.noClassesAssigned"));
        setClasses([]);
        return;
      }

      const classSnapshot = await getDocs(collection(db, "classes"));
      const classData = classSnapshot.docs
        .filter((doc) => teacherClassIds.includes(doc.id))
        .map((doc) => ({
          id: doc.id,
          name: doc.data().name || t("teacher.homework.unknownClass"),
        })) as Class[];

      setClasses(classData);

      if (classData.length === 1) {
        setSelectedClass(classData[0]);
      } else if (classData.length > 1 && userData?.classId) {
        const defaultClass = classData.find((c) => c.id === userData.classId);
        if (defaultClass) {
          setSelectedClass(defaultClass);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("teacher.homework.loadClassesError");
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user, userData, t]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleCreateHomework = async () => {
    try {
      if (!selectedClass) {
        Alert.alert(t("common.error"), t("teacher.homework.selectClassAlert"));
        return;
      }

      if (!title || !title.trim()) {
        Alert.alert(t("common.error"), t("teacher.homework.titleRequired"));
        return;
      }

      if (!details || !details.trim()) {
        Alert.alert(t("common.error"), t("teacher.homework.detailsRequired"));
        return;
      }

      setSaving(true);
      setError(null);

      const homeworkData: Record<string, unknown> = {
        title: title.trim(),
        details: details.trim(),
        classId: selectedClass.id,
        teacherId: user?.uid,
        createdAt: new Date(),
      };

      if (dueDate) {
        homeworkData.dueDate = new Date(dueDate);
      }

      await addDoc(
        collection(db, "classes", selectedClass.id, "homework"),
        homeworkData,
      );

      Alert.alert(
        t("common.success"),
        t("teacher.homework.createdFor", { name: selectedClass.name }),
      );

      setTitle("");
      setDetails("");
      setDueDate("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("teacher.homework.createError");
      setError(message);
      Alert.alert(t("common.error"), message);
    } finally {
      setSaving(false);
    }
  };

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(classSearch.toLowerCase()),
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t("teacher.homework.title")}</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.section}>
          <Text style={styles.label}>{t("teacher.homework.classLabel")}</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowClassModal(true)}
            disabled={saving}
          >
            <Text
              style={[
                styles.dropdownText,
                !selectedClass && styles.placeholderText,
              ]}
            >
              {selectedClass
                ? selectedClass.name
                : t("teacher.homework.selectClass")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("teacher.homework.titleLabel")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("teacher.homework.titlePlaceholder")}
            value={title}
            onChangeText={setTitle}
            editable={!saving}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("teacher.homework.detailsLabel")}</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder={t("teacher.homework.detailsPlaceholder")}
            value={details}
            onChangeText={setDetails}
            multiline
            editable={!saving}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("teacher.homework.dueDateLabel")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("teacher.homework.dueDatePlaceholder")}
            value={dueDate}
            onChangeText={setDueDate}
            editable={!saving}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleCreateHomework}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>{t("teacher.homework.saveHomework")}</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={showClassModal}
        animationType="slide"
        onRequestClose={() => setShowClassModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t("teacher.homework.selectClassModal")}
            </Text>
            <TouchableOpacity onPress={() => setShowClassModal(false)}>
              <Text style={styles.closeButton}>{t("common.close")}</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder={t("teacher.homework.searchClasses")}
            value={classSearch}
            onChangeText={setClassSearch}
          />

          {filteredClasses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t("teacher.homework.noClassesFound")}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredClasses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    selectedClass?.id === item.id && styles.selectedListItem,
                  ]}
                  onPress={() => {
                    setSelectedClass(item);
                    setShowClassModal(false);
                    setClassSearch("");
                  }}
                >
                  <Text
                    style={[
                      styles.listItemName,
                      selectedClass?.id === item.id &&
                        styles.selectedListItemText,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
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

  descriptionInput: {
    minHeight: 120,
    paddingTop: 15,
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
  },

  selectedListItemText: {
    color: "#007AFF",
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
