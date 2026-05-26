import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { AuthContext } from "../../src/context/authContext";
import { loadStudentsForTeacher } from "../../src/services/teacherStudents";

export default function TeacherStudents() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const [students, setStudents] = useState<any[]>([]);

  const loadStudents = useCallback(async () => {
    if (!user) return;

    const { students: loaded } = await loadStudentsForTeacher(user.uid);
    setStudents(loaded);
  }, [user]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t("teacher.students.title")}</Text>

      {students.map((student: any) => (
        <View key={student.id} style={styles.card}>
          <Text style={styles.name}>{student.name}</Text>

          <Text style={styles.email}>{student.email}</Text>
        </View>
      ))}
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

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
  },

  email: {
    color: "#666",
    marginTop: 4,
  },
});
