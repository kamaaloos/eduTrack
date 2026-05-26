import { collection, getDocs, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { db } from "../../src/services/firebase";

export default function RemarksScreen() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);
  const [remarks, setRemarks] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.uid || !userData?.classId) return;

      const snap = await getDocs(
        query(
          collection(db, "classes", userData.classId, "remarks"),
          where("studentId", "==", user.uid)
        )
      );
      setRemarks(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as any));
    };

    load();
  }, [user?.uid, userData?.classId]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t("common.remarks")}</Text>

      {remarks.map((r) => (
        <View key={r.id} style={styles.card}>
          <Text style={styles.name}>{r.text || r.remark}</Text>
          <Text>
            {t("common.teacher")}:{" "}
            {r.teacherEmail || r.teacher || t("common.unknown")}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F7FA" },
  title: { fontSize: 28, fontWeight: "bold", marginTop: 50, marginBottom: 20 },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  name: { fontWeight: "600" },
});
