import { Text, View } from "react-native";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../src/services/firebase";
import { filterAnnouncementsForViewer } from "../../src/utils/announcementVisibility";
import { AuthContext } from "../../src/context/authContext";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { studentScreenStyles as styles } from "../../components/students/studentScreenStyles";

export default function MessagesScreen() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!userData?.classId || !user?.uid) return;
      const snap = await getDocs(
        collection(db, "classes", userData.classId, "announcements"),
      );
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(
        filterAnnouncementsForViewer(all, {
          userId: user.uid,
          role: "student",
          studentId: user.uid,
        }),
      );
    };

    load();
  }, [userData?.classId, user?.uid]);

  return (
    <StudentScreenShell
      title={t("student.messages")}
      showBack
      showMenu={false}
    >
      {messages.length === 0 ? (
        <Text style={styles.emptyText}>{t("common.noData")}</Text>
      ) : (
        messages.map((m) => (
          <View key={m.id} style={styles.listCard}>
            <Text style={styles.listCardTitle}>{m.title}</Text>
            <Text style={styles.listCardBody}>{m.text || m.message}</Text>
          </View>
        ))
      )}
    </StudentScreenShell>
  );
}
