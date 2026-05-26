import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { db } from "../../src/services/firebase";

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

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{item.title || t("student.homework")}</Text>
      <Text style={styles.subject}>{item.subject || t("common.subject")}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{t("common.date")}</Text>
        <Text style={styles.metaValue}>
          {item.daysLeft != null
            ? t("student.dueDate", { date: `${item.daysLeft} day(s)` })
            : "—"}
        </Text>
      </View>

      {item.teacherName ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t("common.teacher")}</Text>
          <Text style={styles.metaValue}>{item.teacherName}</Text>
        </View>
      ) : null}

      {item.details || item.description ? (
        <>
          <Text style={styles.sectionLabel}>{t("common.details")}</Text>
          <Text style={styles.body}>
            {item.details || item.description}
          </Text>
        </>
      ) : (
        <Text style={styles.body}>{t("common.notAvailable")}</Text>
      )}
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
  loading: { fontSize: 16, color: "#6B7280" },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  subject: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  metaLabel: { color: "#6B7280", fontWeight: "600" },
  metaValue: { color: "#1F2937", fontWeight: "700" },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
  },
});
