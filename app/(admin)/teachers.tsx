import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../src/services/firebase";

export default function AdminTeachersScreen() {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState<any[]>([]);

  const loadTeachers = async () => {
    const snap = await getDocs(collection(db, "users"));
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((u: any) => u.role === "teacher");

    setTeachers(data);
  };

  useEffect(() => {
    void loadTeachers();
  }, []);

  const removeTeacher = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", id));
      Alert.alert(t("admin.teacherRemoved"));
      void loadTeachers();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("admin.teachersManagement")}</Text>

      <FlatList
        data={teachers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name || item.email}</Text>
            <Text style={styles.sub}>{item.email}</Text>
            <Text style={styles.role}>
              {t("admin.roleDisplay", { role: item.role })}
            </Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => removeTeacher(item.id)}
            >
              <Text style={styles.btnText}>{t("common.remove")}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F7FA",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  sub: {
    color: "#666",
  },
  role: {
    marginTop: 5,
    color: "#888",
  },
  btn: {
    marginTop: 10,
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "700",
  },
});
