import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { db } from "../../src/services/firebase";
import { getAttendanceColor } from "../../src/utils/dashboardUi";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { studentScreenStyles as styles } from "../../components/students/studentScreenStyles";

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
  const screenTitle = item?.date || paramDate || t("common.attendance");

  return (
    <StudentScreenShell title={screenTitle} showBack showMenu={false}>
      <View style={styles.detailCard}>
        <View style={styles.detailMetaRow}>
          <Text style={styles.detailMetaLabel}>{t("common.status")}</Text>
          <Text style={[styles.detailMetaValue, { color: colors.text }]}>
            {colors.label}
          </Text>
        </View>
      </View>

      {parentReason ? (
        <>
          <Text style={styles.detailSectionLabel}>{t("common.parent")}</Text>
          <View style={styles.detailCard}>
            <Text style={styles.detailBody}>{parentReason}</Text>
          </View>
        </>
      ) : null}

      <Text style={styles.detailSectionLabel}>{t("common.details")}</Text>
      <View style={styles.detailCard}>
        <Text style={styles.detailBody}>
          {item?.remark || paramRemark || t("common.notAvailable")}
        </Text>
      </View>
    </StudentScreenShell>
  );
}
