import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { db } from "../../src/services/firebase";

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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.badge}>{t("common.remarks")}</Text>
      <Text style={styles.title}>
        {item?.teacherName || item?.teacher || paramTeacher || t("common.teacher")}
      </Text>

      {item?.type || paramType ? (
        <Text style={styles.type}>{item?.type || paramType}</Text>
      ) : null}

      {item?.rating ? (
        <Text style={styles.rating}>
          {"⭐".repeat(Math.min(5, Number(item.rating)))}
        </Text>
      ) : null}

      <Text style={styles.body}>{fullText || t("common.notAvailable")}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 16,
    backgroundColor: "transparent",
  },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  type: {
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "capitalize",
  },
  rating: { fontSize: 18, marginBottom: 16 },
  body: {
    fontSize: 16,
    lineHeight: 26,
    color: "#374151",
  },
});
