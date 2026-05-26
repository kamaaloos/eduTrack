import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { db } from "../../src/services/firebase";
import { getAttendanceColor } from "../../src/utils/dashboardUi";

export default function AttendanceDetailScreen() {
  const { t } = useTranslation();
  const {
    id,
    date: paramDate,
    status: paramStatus,
    remark: paramRemark,
  } = useLocalSearchParams<{
    id: string;
    date?: string;
    status?: string;
    remark?: string;
  }>();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const snap = await getDoc(doc(db, "attendance", String(id)));
        if (snap.exists()) {
          setItem({ id: snap.id, ...snap.data() });
        } else {
          setItem({
            date: paramDate,
            status: paramStatus,
            remark: paramRemark,
          });
        }
      } catch {
        setItem({
          date: paramDate,
          status: paramStatus,
          remark: paramRemark,
        });
      }
    })();
  }, [id, paramDate, paramStatus, paramRemark]);

  const status = (item?.status || paramStatus || "unknown").toLowerCase();
  const colors = getAttendanceColor(status, item?.parentResponse);
  const parentReason = item?.parentResponse?.reason as string | undefined;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.badge}>{t("common.attendance")}</Text>
      <Text style={styles.title}>{item?.date || paramDate || "—"}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{t("common.status")}</Text>
        <Text style={[styles.metaValue, { color: colors.text }]}>
          {colors.label}
        </Text>
      </View>

      {parentReason ? (
        <>
          <Text style={styles.sectionLabel}>{t("common.parent")}</Text>
          <Text style={styles.body}>{parentReason}</Text>
        </>
      ) : null}

      <Text style={styles.sectionLabel}>{t("common.details")}</Text>
      <Text style={styles.body}>
        {item?.remark || paramRemark || t("common.notAvailable")}
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
  badge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  metaLabel: { color: "#6B7280", fontWeight: "600" },
  metaValue: { fontWeight: "700", fontSize: 16 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    color: "#374151",
  },
});
