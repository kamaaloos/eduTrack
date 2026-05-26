import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParentChild } from "../../src/context/parentChildContext";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../src/context/authContext";
import {
  loadParentChildrenDetailed,
  type ParentChild,
} from "../../src/services/parentChildren";
import { FLOATING_TAB_BAR_INSET } from "../../src/constants/tabBar";

export default function ParentDashboard() {
  const { t } = useTranslation();
  const { user, userData, logout } = useContext(AuthContext);
  const { setSelectedChild } = useParentChild();
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partialWarning, setPartialWarning] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.uid) return;
    setError(null);
    setPartialWarning(null);
    try {
      const { children: list, failedStudentIds } =
        await loadParentChildrenDetailed(user.uid);
      setChildren(list);
      if (failedStudentIds.length > 0) {
        setPartialWarning(
          t("parent.partialLoadWarning", { count: failedStudentIds.length }),
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("parent.loadError");
      setError(message);
      console.error("Parent children load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const handleLogout = () => {
    Alert.alert(t("profile.signOutTitle"), t("profile.signOutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (err) {
            Alert.alert(
              t("common.error"),
              err instanceof Error ? err.message : t("common.somethingWentWrong"),
            );
          }
        },
      },
    ]);
  };

  const openChild = (child: ParentChild) => {
    setSelectedChild({
      id: child.id,
      name: child.name,
      classId: child.classId,
      className: child.className,
    });
    router.push({
      pathname: "/(parent)/student/[id]",
      params: {
        id: child.id,
        name: child.name,
        classId: child.classId ?? "",
        className: child.className ?? "",
      },
    });
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.header} edges={["top"]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.greeting}>
              {t("parent.homeGreeting", {
                name: userData?.name || t("common.parent"),
              })}
            </Text>
            <Text style={styles.subtitle}>{t("parent.dashboardSubtitle")}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            accessibilityLabel={t("common.logout")}
          >
            <Ionicons name="log-out-outline" size={18} color="#1E3A8A" />
            <Text style={styles.logoutText}>{t("common.logout")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {partialWarning ? (
            <View style={styles.warnBox}>
              <Text style={styles.warnText}>{partialWarning}</Text>
            </View>
          ) : null}

          {children.length === 0 && !error ? (
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>{t("parent.noChildren")}</Text>
            </View>
          ) : null}

          {children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={styles.childCard}
              onPress={() => openChild(child)}
              activeOpacity={0.85}
            >
              <View style={styles.childIcon}>
                <Ionicons name="person" size={28} color="#1E3A8A" />
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childMeta}>
                  {child.className || child.classId || t("common.class")}
                </Text>
                {child.email ? (
                  <Text style={styles.childEmail}>{child.email}</Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: "#1E3A8A",
    fontWeight: "700",
    fontSize: 13,
  },
  greeting: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: "#BFDBFE",
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  scroll: {
    padding: 16,
    paddingBottom: FLOATING_TAB_BAR_INSET,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  childCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  childIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  childInfo: {
    flex: 1,
    minWidth: 0,
  },
  childName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  childMeta: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  childEmail: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  emptyBox: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 12,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: "#B91C1C",
    fontWeight: "600",
  },
  warnBox: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warnText: {
    color: "#92400E",
    fontSize: 13,
    lineHeight: 20,
  },
});
