import { Text, View } from "react-native";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../src/services/firebase";
import { AuthContext } from "../../src/context/authContext";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { studentScreenStyles as styles } from "../../components/students/studentScreenStyles";

export default function ExamsScreen() {
  const { t } = useTranslation();
  const { userData } = useContext(AuthContext);
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!userData?.classId) return;
      const snap = await getDocs(
        collection(db, "classes", userData.classId, "exams"),
      );
      setExams(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    load();
  }, [userData?.classId]);

  return (
    <StudentScreenShell title={t("common.exams")} showBack showMenu={false}>
      {exams.length === 0 ? (
        <Text style={styles.emptyText}>{t("student.noExams")}</Text>
      ) : (
        exams.map((e) => (
          <View key={e.id} style={styles.listCard}>
            <Text style={styles.listCardTitle}>{e.subject}</Text>
            <Text style={styles.listCardBody}>
              {t("common.date")}: {e.date}
            </Text>
          </View>
        ))
      )}
    </StudentScreenShell>
  );
}
