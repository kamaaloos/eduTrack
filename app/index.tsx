import { useContext, useEffect, useState } from "react";

import { ActivityIndicator, Platform, Text, View } from "react-native";
import { safeRouterReplace } from "../src/utils/safeNavigation";
import { useTranslation } from "react-i18next";

import { router, useRootNavigationState, useSegments } from "expo-router";

import { AuthContext } from "../src/context/authContext";
import { useSchoolContext } from "../src/context/schoolContext";
import { useSuperAdminAuth } from "../src/context/superAdminAuthContext";
import {
  getPostLoginRoute,
  isPublicEntrySegment,
} from "../src/utils/authNavigation";
import { authLog } from "../src/utils/authDebug";
import { hasCompletedOnboarding } from "../src/utils/onboardingStorage";

export default function Index() {
  const { t } = useTranslation();
  const { user, userData, role, loading } = useContext(AuthContext);
  const {
    user: superAdminUser,
    role: superAdminRole,
    loading: superAdminLoading,
  } = useSuperAdminAuth();
  const { selectedSchool, schoolReady } = useSchoolContext();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const navigationReady = Boolean(rootNavigationState?.key);
  const firstSegment = segments[0] as string | undefined;

  useEffect(() => {
    let active = true;

    void hasCompletedOnboarding().then((complete) => {
      if (active) {
        setOnboardingComplete(complete);
        setOnboardingChecked(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (
      !navigationReady ||
      loading ||
      superAdminLoading ||
      !onboardingChecked ||
      !schoolReady
    ) {
      if (user) {
        authLog("index:waiting", {
          navigationReady,
          loading,
          superAdminLoading,
          onboardingChecked,
          schoolReady,
          role: role ?? null,
        });
      }
      return;
    }

    if (superAdminUser && superAdminRole === "superAdmin") {
      if (firstSegment !== "(super-admin)") {
        router.replace("/(super-admin)/schools");
      }
      return;
    }

    if (user) {
      if (!role) {
        return;
      }

      if (isPublicEntrySegment(firstSegment)) {
        const target = getPostLoginRoute(role, userData);
        authLog("index:navigate", { role, target, firstSegment: firstSegment ?? null });
        safeRouterReplace(router, target);
      }
      return;
    }

    if (Platform.OS === "web") {
      const onLanding = firstSegment === "landing";
      const onPublicPage = Boolean(firstSegment && isPublicEntrySegment(firstSegment));
      if (!onLanding && !onPublicPage) {
        safeRouterReplace(router, "/landing");
      }
      return;
    }

    if (!onboardingComplete) {
      if (firstSegment !== "onboarding") {
        safeRouterReplace(router, "/onboarding");
      }
      return;
    }

    if (!selectedSchool) {
      if (firstSegment !== "select-school") {
        safeRouterReplace(router, "/select-school");
      }
      return;
    }

    if (firstSegment !== "login") {
      safeRouterReplace(router, "/login");
    }
  }, [
    navigationReady,
    user,
    role,
    loading,
    superAdminUser,
    superAdminRole,
    superAdminLoading,
    onboardingChecked,
    onboardingComplete,
    schoolReady,
    selectedSchool,
    firstSegment,
    userData,
  ]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#6B9FD4",
      }}
    >
      <ActivityIndicator size="large" color="#FFFFFF" />
      <Text style={{ marginTop: 16, fontSize: 16, color: "#FFFFFF" }}>
        {t("index.loading")}
      </Text>
    </View>
  );
}
