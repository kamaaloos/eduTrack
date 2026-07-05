import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet } from "react-native";
import { AdminParentsOverview } from "../../components/admin/AdminParentsOverview";
import { SecretaryScreenShell } from "../../components/secretary/SecretaryScreenShell";
import { useSecretaryData } from "../../src/context/secretaryDataContext";

export default function SecretaryDashboardScreen() {
  const { t } = useTranslation();
  const { loadUsers } = useSecretaryData();

  useFocusEffect(
    useCallback(() => {
      void loadUsers();
    }, [loadUsers]),
  );

  return (
    <SecretaryScreenShell
      title={t("secretary.dashboardTitle")}
      subtitle={t("secretary.dashboardSubtitle")}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AdminParentsOverview
          parentDetailPath="/(secretary)/parent/[parentId]"
          useParentsData={useSecretaryData}
        />
      </ScrollView>
    </SecretaryScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});
