import { db } from "../../../src/services/firebase";
import { useLocalSearchParams } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { TeacherScreenShell } from "../../../components/teachers/TeacherScreenShell";
import { useSchoolContext } from "../../../src/context/schoolContext";
import { useFirestoreListenerEffect } from "../../../hooks/useFirestoreListenerEffect";

export default function ClassPage() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const { selectedSchool } = useSchoolContext();
  const schoolKey = selectedSchool?.id ?? null;

  const [students, setStudents] = useState<any[]>([]);

  useFirestoreListenerEffect(() => {
    if (!id || !db || !schoolKey) return;

    const studentsQuery = query(
      collection(db, "users"),
      where("role", "==", "student"),
      where("classId", "==", id),
    );

    return onSnapshot(studentsQuery, (snapshot) => {
      const studentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setStudents(studentsData);
    });
  }, [id, schoolKey]);

  return (
    <TeacherScreenShell
      title={t("teacher.classDetail.title")}
      subtitle={`${students.length} ${t("common.students")}`}
      showBack
    >
      {students.length === 0 ? (
        <Text style={styles.emptyText}>{t("teacher.classDetail.noStudents")}</Text>
      ) : (
        students.map((student) => (
          <View key={student.id} style={styles.studentCard}>
            <Text style={styles.studentName}>{student.name}</Text>
            <Text style={styles.studentEmail}>{student.email}</Text>
          </View>
        ))
      )}
    </TeacherScreenShell>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginTop: 24,
  },
  studentCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  studentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  studentEmail: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
});
