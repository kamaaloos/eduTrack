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

export default function MessagesScreen() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);

  const [classId, setClassId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    const targetClassId = classId || userData?.classId;

    if (!targetClassId || !title || !message) {
      Alert.alert(t("teacher.messages.fillAllFields"));
      return;
    }

    try {
      await addDoc(collection(db, "classes", targetClassId, "announcements"), {
        title,
        text: message,
        message,
        icon: "📢",
        classId: targetClassId,

        senderId: user?.uid,
        senderEmail: user?.email,

        createdAt: new Date(),
      });

      Alert.alert(t("teacher.messages.messageSent"));

      setTitle("");
      setMessage("");
      setClassId("");
    } catch (error) {
      console.log(error);

      Alert.alert(t("teacher.messages.sendError"));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t("teacher.messages.title")}</Text>

      <TextInput
        style={styles.input}
        placeholder={t("teacher.messages.classIdPlaceholder")}
        value={classId}
        onChangeText={setClassId}
      />

      <TextInput
        style={styles.input}
        placeholder={t("teacher.messages.titlePlaceholder")}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, { height: 120 }]}
        placeholder={t("teacher.messages.messagePlaceholder")}
        multiline
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity style={styles.button} onPress={sendMessage}>
        <Text style={styles.buttonText}>{t("teacher.messages.sendMessage")}</Text>
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
