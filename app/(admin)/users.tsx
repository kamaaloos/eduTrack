import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { AdminScreenHeader } from "../../components/admin/AdminScreenHeader";
import { UserCreationCard } from "../../components/admin/UserCreationCard";
import { useAdminData } from "../../src/context/adminDataContext";

export default function AdminUsersScreen() {
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
          title={t("admin.users")}
          subtitle={t("admin.usersSubtitle")}
          showBack
        />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.panel}>
            <UserCreationCard onUserCreated={refreshAll} />
          </View>
          <Text style={styles.hint}>{t("admin.usersHint")}</Text>
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
  },
  hint: {
    marginTop: 16,
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 8,
  },
});
