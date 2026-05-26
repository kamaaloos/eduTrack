import { useContext, useEffect, useState } from "react";

import { ActivityIndicator, Text, View } from "react-native";
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

      // Logged in: only redirect from entry screens (index/login/onboarding).
      // When returning from background, keep the screen the user was on.
      if (isPublicEntrySegment(firstSegment)) {
        router.replace(getPostLoginRoute(role, userData) as never);
      }
      return;
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
        backgroundColor: "#F5F7FA",
      }}
    >
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
        {t("index.loading")}
      </Text>
    </View>
  );
}
