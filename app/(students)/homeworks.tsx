import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../src/services/firebase";
import { AuthContext } from "../../src/context/authContext";

export default function HomeworkScreen() {
  const { t } = useTranslation();
  const { userData } = useContext(AuthContext);
  const [homeworks, setHomeworks] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!userData?.classId) return;

      const snap = await getDocs(
        collection(db, "classes", userData.classId, "homework")
      );
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      setHomeworks(data);
    };

    load();
  }, [userData?.classId]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t("student.homework")}</Text>

      {homeworks.map(h => (
        <View key={h.id} style={styles.card}>
          <Text style={styles.name}>{h.title}</Text>
          <Text>{h.details || h.description || t("common.details")}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F7FA" },
  title: { fontSize: 28, fontWeight: "bold", marginTop: 50, marginBottom: 20 },
  card: { backgroundColor: "white", padding: 15, borderRadius: 12, marginBottom: 10 },
  name: { fontWeight: "700", fontSize: 16 }
});