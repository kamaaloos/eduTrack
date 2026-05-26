import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../src/services/firebase";
import { AuthContext } from "../../src/context/authContext";

export default function MessagesScreen() {
  const { t } = useTranslation();
  const { userData } = useContext(AuthContext);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!userData?.classId) return;
      const snap = await getDocs(
        collection(db, "classes", userData.classId, "announcements")
      );
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    load();
  }, [userData?.classId]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t("student.messages")}</Text>

      {messages.map(m => (
        <View key={m.id} style={styles.card}>
          <Text style={styles.name}>{m.title}</Text>
          <Text>{m.text || m.message}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F7FA" },
  title: { fontSize: 28, fontWeight: "bold", marginTop: 50, marginBottom: 20 },
  card: { backgroundColor: "white", padding: 15, borderRadius: 12, marginBottom: 10 },
  name: { fontWeight: "700" }
});