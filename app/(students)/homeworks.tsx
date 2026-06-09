import { Text, View } from "react-native";
import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../src/services/firebase";
import { AuthContext } from "../../src/context/authContext";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { studentScreenStyles as styles } from "../../components/students/studentScreenStyles";

export default function HomeworkScreen() {
  const { t } = useTranslation();
  const { userData } = useContext(AuthContext);
  const [homeworks, setHomeworks] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!userData?.classId) return;

      const snap = await getDocs(
        collection(db, "classes", userData.classId, "homework"),
      );
      setHomeworks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    load();
  }, [userData?.classId]);

  return (
    <StudentScreenShell title={t("student.homework")} showBack showMenu={false}>
      {homeworks.length === 0 ? (
        <Text style={styles.emptyText}>{t("student.noHomework")}</Text>
      ) : (
        homeworks.map((h) => (
          <View key={h.id} style={styles.listCard}>
            <Text style={styles.listCardTitle}>{h.title}</Text>
            <Text style={styles.listCardBody}>
              {h.details || h.description || t("common.details")}
            </Text>
          </View>
        ))
      )}
    </StudentScreenShell>
  );
}
