import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { AdminScreenHeader } from "../../components/admin/AdminScreenHeader";
import { ClassDirectoryList } from "../../components/admin/ClassDirectoryList";
import { useAdminData } from "../../src/context/adminDataContext";

export default function ClassDirectoryScreen() {
  const { t } = useTranslation();
  const { refreshAll } = useAdminData();

  useFocusEffect(
    useCallback(() => {
      void refreshAll();
    }, [refreshAll]),
  );

  return (
    <ErrorBoundary>
      <View style={styles.screen}>
        <AdminScreenHeader
          title={t("admin.classes")}
          subtitle={t("admin.classDirectorySubtitle")}
          showBack
        />
        <View style={styles.body}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <ClassDirectoryList />
          </ScrollView>
        </View>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  body: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
});
