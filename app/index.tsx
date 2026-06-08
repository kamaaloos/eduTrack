import { useContext, useEffect, useState } from "react";

import { ActivityIndicator, InteractionManager, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { router, useRootNavigationState, useSegments } from "expo-router";

import { AuthContext } from "../src/context/authContext";
import { useSchoolContext } from "../src/context/schoolContext";
import { useSuperAdminAuth } from "../src/context/superAdminAuthContext";
import {
  getPostLoginRoute,
  isPublicEntrySegment,
} from "../src/utils/authNavigation";
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
      return;
    }

    let cancelled = false;
    let navigationTask: { cancel: () => void } | null = null;

    const navigate = (href: string) => {
      navigationTask = InteractionManager.runAfterInteractions(() => {
        if (!cancelled) {
          router.replace(href as never);
        }
      });
    };

    if (superAdminUser && superAdminRole === "superAdmin") {
      if (firstSegment !== "(super-admin)") {
        navigate("/(super-admin)/schools");
      }
      return () => {
        cancelled = true;
        navigationTask?.cancel();
      };
    }

    if (user) {
      if (!role) {
        return;
      }

      // Logged in: only redirect from entry screens (index/login/onboarding).
      // When returning from background, keep the screen the user was on.
      if (isPublicEntrySegment(firstSegment)) {
        navigate(getPostLoginRoute(role, userData));
      }
      return () => {
        cancelled = true;
        navigationTask?.cancel();
      };
    }

    if (!onboardingComplete) {
      if (firstSegment !== "onboarding") {
        router.replace("/onboarding");
      }
      return;
    }

    if (!selectedSchool) {
      if (firstSegment !== "select-school") {
        router.replace("/select-school");
      }
      return;
    }

    if (firstSegment !== "login") {
      router.replace("/login");
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
