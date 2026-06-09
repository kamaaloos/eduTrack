import { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { db } from "../../src/services/firebase";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { studentScreenStyles as styles } from "../../components/students/studentScreenStyles";

export default function ExamDetailScreen() {
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
          doc(db, "classes", classId, "exams", String(id)),
        );
        if (snap.exists()) {
          setItem({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Failed to load exam:", err);
      }
    })();
  }, [id, classId]);

  const screenTitle = item?.title || t("common.exams");

  if (!item) {
    return (
      <StudentScreenShell title={screenTitle} showBack showMenu={false}>
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </StudentScreenShell>
    );
  }

  const status = item.status || "Scheduled";

  return (
    <StudentScreenShell title={screenTitle} showBack showMenu={false}>
      {item.subject ? (
        <Text style={[styles.detailSubtitle, { color: "#7C3AED" }]}>
          {item.subject}
        </Text>
      ) : null}

      <View style={styles.detailCard}>
        <View style={styles.detailMetaRow}>
          <Text style={styles.detailMetaLabel}>{t("common.status")}</Text>
          <Text
            style={[
              styles.detailMetaValue,
              { color: status === "Completed" ? "#16A34A" : "#D97706" },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>

      {item.date ? (
        <View style={styles.detailCard}>
          <View style={styles.detailMetaRow}>
            <Text style={styles.detailMetaLabel}>{t("common.date")}</Text>
            <Text style={styles.detailMetaValue}>{item.date}</Text>
          </View>
        </View>
      ) : null}

      {item.marks != null ? (
        <View style={styles.detailCard}>
          <View style={styles.detailMetaRow}>
            <Text style={styles.detailMetaLabel}>{t("common.score")}</Text>
            <Text style={styles.detailMetaValue}>{item.marks}</Text>
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
