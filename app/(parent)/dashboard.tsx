import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParentChild } from "../../src/context/parentChildContext";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParentChildrenList } from "../../components/parent/ParentChildrenList";
import { ParentScreenShell } from "../../components/parent/ParentScreenShell";
import { AuthContext } from "../../src/context/authContext";
import { copyrightFooterInset } from "../../src/constants/appTheme";
import { INNER_CARD_BORDER_GREEN } from "../../../src/constants/innerCardBorders";
import {
  loadParentChildrenDetailed,
  type ParentChild,
} from "../../src/services/parentChildren";

export default function ParentDashboard() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user, userData } = useContext(AuthContext);
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

  const openChild = (child: ParentChild) => {
    setSelectedChild({
      id: child.id,
      name: child.name,
      photoURL: child.photoURL,
      classId: child.classId,
      className: child.className,
    });
    router.push({
      pathname: "/(parent)/student/[id]",
      params: {
        id: child.id,
        name: child.name,
        photoURL: child.photoURL ?? "",
        classId: child.classId ?? "",
        className: child.className ?? "",
      },
    });
  };

  return (
    <ParentScreenShell
      title={t("parent.homeGreeting", {
        name: userData?.name || t("common.parent"),
      })}
      subtitle={t("parent.dashboardSubtitle")}
    >
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingBottom: copyrightFooterInset(insets.bottom, 8) + 16,
            },
          ]}
          showsVerticalScrollIndicator={false}
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

          {children.length > 0 ? (
            <ParentChildrenList childList={children} onSelect={openChild} />
          ) : null}
        </ScrollView>
      )}
    </ParentScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingTop: Platform.OS === "web" ? 8 : 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyBox: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 12,
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    maxWidth: 680,
    alignSelf: "center",
    width: "100%",
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
    maxWidth: 680,
    alignSelf: "center",
    width: "100%",
  },
  warnText: {
    color: "#92400E",
    fontSize: 13,
    lineHeight: 20,
  },
});
