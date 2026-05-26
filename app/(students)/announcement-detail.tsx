import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { db } from "../../src/services/firebase";

export default function AnnouncementDetailScreen() {
  const { t } = useTranslation();
  const { id, classId: paramClassId, title: paramTitle, body: paramBody } =
    useLocalSearchParams<{
      id: string;
      classId?: string;
      title?: string;
      body?: string;
    }>();
  const { userData } = useContext(AuthContext);
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const fallbackTitle = paramTitle || t("common.announcements");
    const classId = paramClassId || userData?.classId;
    if (!classId) {
      setItem({
        title: fallbackTitle,
        text: paramBody || "",
      });
      return;
    }

    (async () => {
      try {
        const snap = await getDoc(
          doc(db, "classes", classId, "announcements", String(id)),
        );
        if (snap.exists()) {
          setItem({ id: snap.id, ...snap.data() });
        } else {
          setItem({
            title: fallbackTitle,
            text: paramBody || "",
          });
        }
      } catch {
        setItem({
          title: fallbackTitle,
          text: paramBody || "",
        });
      }
    })();
  }, [id, paramClassId, userData?.classId, paramTitle, paramBody, t]);

  const fullText = item?.text || item?.message || paramBody || "";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.icon}>{item?.icon || "📢"}</Text>
      <Text style={styles.title}>
        {item?.title || paramTitle || t("common.announcements")}
      </Text>
      <Text style={styles.body}>
        {fullText || t("common.notAvailable")}
      </Text>
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
  icon: { fontSize: 32, marginBottom: 12 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    color: "#374151",
  },
});
