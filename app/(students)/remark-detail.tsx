import { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { db } from "../../src/services/firebase";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { studentScreenStyles as styles } from "../../components/students/studentScreenStyles";

export default function RemarkDetailScreen() {
  const { t } = useTranslation();
  const {
    id,
    classId: paramClassId,
    body: paramBody,
    teacher: paramTeacher,
    type: paramType,
  } = useLocalSearchParams<{
    id: string;
    classId?: string;
    body?: string;
    teacher?: string;
    type?: string;
  }>();
  const { userData } = useContext(AuthContext);
  const [item, setItem] = useState<any>(null);

  const classId = paramClassId || userData?.classId;

  useEffect(() => {
    if (!id) return;

    if (!classId) {
      setItem({
        text: paramBody || "",
        teacherName: paramTeacher,
        type: paramType,
      });
      return;
    }

    (async () => {
      try {
        const snap = await getDoc(
          doc(db, "classes", classId, "remarks", String(id)),
        );
        if (snap.exists()) {
          setItem({ id: snap.id, ...snap.data() });
        } else {
          setItem({
            text: paramBody || "",
            teacherName: paramTeacher,
            type: paramType,
          });
        }
      } catch {
        setItem({
          text: paramBody || "",
          teacherName: paramTeacher,
          type: paramType,
        });
      }
    })();
  }, [id, classId, paramBody, paramTeacher, paramType]);

  const fullText = item?.text || item?.remark || paramBody || "";
  const screenTitle =
    item?.teacherName || item?.teacher || paramTeacher || t("common.remarks");

  return (
    <StudentScreenShell title={screenTitle} showBack showMenu={false}>
      {item?.type || paramType ? (
        <Text style={styles.detailSubtitle}>{item?.type || paramType}</Text>
      ) : null}

      {item?.rating ? (
        <Text style={[styles.detailBody, { marginBottom: 12 }]}>
          {"★".repeat(Math.min(5, Number(item.rating)))}
        </Text>
      ) : null}

      <View style={styles.detailCard}>
        <Text style={styles.detailBody}>
          {fullText || t("common.notAvailable")}
        </Text>
      </View>
    </StudentScreenShell>
  );
}
