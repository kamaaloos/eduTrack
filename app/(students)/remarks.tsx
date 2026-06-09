import { collection, getDocs, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { db } from "../../src/services/firebase";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { studentScreenStyles as styles } from "../../components/students/studentScreenStyles";

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
          where("studentId", "==", user.uid),
        ),
      );
      setRemarks(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as any));
    };

    load();
  }, [user?.uid, userData?.classId]);

  return (
    <StudentScreenShell title={t("common.remarks")} showBack showMenu={false}>
      {remarks.length === 0 ? (
        <Text style={styles.emptyText}>{t("common.noData")}</Text>
      ) : (
        remarks.map((r) => (
          <View key={r.id} style={styles.listCard}>
            <Text style={styles.listCardTitle}>{r.text || r.remark}</Text>
            <Text style={styles.listCardBody}>
              {t("common.teacher")}:{" "}
              {r.teacherEmail || r.teacher || t("common.unknown")}
            </Text>
          </View>
        ))
      )}
    </StudentScreenShell>
  );
}
