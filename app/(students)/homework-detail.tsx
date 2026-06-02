import { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { db } from "../../src/services/firebase";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { studentScreenStyles as styles } from "../../components/students/studentScreenStyles";

export default function HomeworkDetailScreen() {
  const { t } = useTranslation();
  const { id, classId: paramClassId } = useLocalSearchParams<{
    id: string;
    classId?: string;
  }>();
  const { userData } = useContext(AuthContext);
  const [item, setItem] = useState<any>(null);

  const classId = paramClassId || userData?.classId;

  useEffect(() => {
    if (!id || !classId) return;

    (async () => {
      try {
        const snap = await getDoc(
          doc(db, "classes", classId, "homework", String(id)),
        );
        if (snap.exists()) {
          setItem({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Failed to load homework:", err);
      }
    })();
  }, [id, classId]);

  const screenTitle = item?.title || t("student.homework");

  if (!item) {
    return (
      <StudentScreenShell title={screenTitle} showBack showMenu={false}>
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </StudentScreenShell>
    );
  }

  return (
    <StudentScreenShell title={screenTitle} showBack showMenu={false}>
      {item.subject ? (
        <Text style={styles.detailSubtitle}>{item.subject}</Text>
      ) : null}

      <View style={styles.detailCard}>
        <View style={styles.detailMetaRow}>
          <Text style={styles.detailMetaLabel}>{t("common.date")}</Text>
          <Text style={styles.detailMetaValue}>
            {item.daysLeft != null
              ? t("student.dueDate", { date: `${item.daysLeft} day(s)` })
              : "—"}
          </Text>
        </View>
      </View>

      {item.teacherName ? (
        <View style={styles.detailCard}>
          <View style={styles.detailMetaRow}>
            <Text style={styles.detailMetaLabel}>{t("common.teacher")}</Text>
            <Text style={styles.detailMetaValue}>{item.teacherName}</Text>
          </View>
        </View>
      ) : null}

      <Text style={styles.detailSectionLabel}>{t("common.details")}</Text>
      <View style={styles.detailCard}>
        <Text style={styles.detailBody}>
          {item.details || item.description || t("common.notAvailable")}
        </Text>
      </View>
    </StudentScreenShell>
  );
}
