import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

import { useState, useContext } from "react";
import { useTranslation } from "react-i18next";

import { addDoc, collection } from "firebase/firestore";

import { db } from "../../src/services/firebase";
import { AuthContext } from "../../src/context/authContext";

export default function ExamsScreen() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);

  const [classId, setClassId] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [details, setDetails] = useState("");

  const createExam = async () => {
    const targetClassId = classId || userData?.classId;

    if (!targetClassId || !subject || !date) {
      Alert.alert(t("teacher.exams.fillAllFields"));
      return;
    }

    try {
      await addDoc(collection(db, "classes", targetClassId, "exams"), {
        subject,
        date,
        details: details.trim(),
        classId: targetClassId,
        teacherId: user?.uid,
        createdAt: new Date(),
      });

      Alert.alert(t("teacher.exams.examCreated"));

      setSubject("");
      setDate("");
      setDetails("");
      setClassId("");
    } catch (error) {
      console.log(error);

      Alert.alert(t("teacher.exams.createError"));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t("teacher.exams.title")}</Text>

      <TextInput
        style={styles.input}
        placeholder={t("teacher.exams.classIdPlaceholder")}
        value={classId}
        onChangeText={setClassId}
      />

      <TextInput
        style={styles.input}
        placeholder={t("teacher.exams.subjectPlaceholder")}
        value={subject}
        onChangeText={setSubject}
      />

      <TextInput
        style={styles.input}
        placeholder={t("teacher.exams.examDatePlaceholder")}
        value={date}
        onChangeText={setDate}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder={t("teacher.exams.detailsPlaceholder")}
        value={details}
        onChangeText={setDetails}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.button} onPress={createExam}>
        <Text style={styles.buttonText}>{t("teacher.exams.saveExam")}</Text>
      </TouchableOpacity>
    </ScrollView>
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
  },

  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
  },
});
