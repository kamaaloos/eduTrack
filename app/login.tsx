import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthAboutLink } from "../components/auth/AuthAboutLink";
import { AuthFormField } from "../components/auth/AuthFormField";
import { ForgotPasswordModal } from "../components/auth/ForgotPasswordModal";
import { LoginCardScannerModal } from "../components/auth/LoginCardScannerModal";
import { LoginCardCodeModal } from "../components/auth/LoginCardCodeModal";
import { AppLogo } from "../components/AppLogo";
import { WebPageCard } from "../components/layout/WebPageCard";
import { ScreenBackgroundLayer } from "../components/ScreenBackgroundLayer";
import { usePlatformLayout } from "../hooks/usePlatformLayout";
import { useSchoolContext } from "../src/context/schoolContext";
import { useSchoolTheme } from "../src/context/schoolThemeContext";
import {
  APP_COPYRIGHT,
  copyrightBarBottom,
  copyrightFooterInset,
} from "../src/constants/appTheme";
import { webAuthContentStyle } from "../src/constants/webLayout";
import { WEB_PAGE_ROOT_STYLE } from "../src/constants/webBackground";
import { AuthContext } from "../src/context/authContext";
import { auth } from "../src/services/firebase";
import { requestSchoolPasswordResetHelp } from "../src/services/passwordResetRequest";
import { getSchoolRegistryEntry } from "../src/services/schoolRegistry";
import { isSchoolEntitled } from "../src/utils/schoolSubscriptionAccess";
import {
  confirmAction,
  showErrorAlert,
  showSuccessAlert,
} from "../src/utils/confirmDialog";
import { authLog, withTimeout } from "../src/utils/authDebug";
import { getPostLoginRoute } from "../src/utils/authNavigation";
import { safeRouterReplace } from "../src/utils/safeNavigation";
import { validateEmail } from "../src/utils/validation";

export default function Login() {
  const { t } = useTranslation();
  const layout = usePlatformLayout();
  const {
    user,
    userData,
    role,
    loading: authLoading,
    error: authError,
  } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [awaitingProfile, setAwaitingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showLoginCardScanner, setShowLoginCardScanner] = useState(false);
  const [showLoginCardCode, setShowLoginCardCode] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedSchool, clearSchool, schoolReady } = useSchoolContext();
  const { theme } = useSchoolTheme();
  const [signInHovered, setSignInHovered] = useState(false);
  const [schoolPillHovered, setSchoolPillHovered] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const [logoTilt, setLogoTilt] = useState({ x: 0, y: 0 });
  const navigatedRef = useRef(false);
  const logoSize = layout.isWeb ? 112 : 108;

  const goToPostLogin = useCallback(
    (reason: string) => {
      if (!role || navigatedRef.current) return;
      navigatedRef.current = true;
      const target = getPostLoginRoute(role, userData);
      authLog("login:navigate", { reason, role, target });
      Keyboard.dismiss();
      setAwaitingProfile(false);
      setLoading(false);
      safeRouterReplace(router, target);
    },
    [role, userData, router],
  );

  useEffect(() => {
    if (!user) {
      navigatedRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (schoolReady && !selectedSchool) {
      router.replace("/select-school");
    }
  }, [schoolReady, selectedSchool, router]);

  useEffect(() => {
    if (authError) {
      setError(authError);
      setAwaitingProfile(false);
      setLoading(false);
    }
  }, [authError]);

  // After sign-in: navigate as soon as profile (role) is ready.
  useEffect(() => {
    if (!awaitingProfile) return;
    if (authLoading || !user || !role) return;
    goToPostLogin("signInComplete");
  }, [awaitingProfile, authLoading, user, role, goToPostLogin]);

  // Recovery: session exists but login screen is still visible.
  useEffect(() => {
    if (awaitingProfile || authLoading || !user || !role) return;
    goToPostLogin("sessionRecovery");
  }, [awaitingProfile, authLoading, user, role, goToPostLogin]);

  const handleChangeSchool = () => {
    void (async () => {
      const confirmed = await confirmAction(
        t("auth.login.changeSchoolTitle"),
        t("auth.login.changeSchoolMsg"),
        t("auth.login.changeSchool"),
        t("common.cancel"),
      );
      if (!confirmed) return;

      try {
        await clearSchool();
        router.replace("/select-school");
      } catch (err) {
        showErrorAlert(
          t("common.error"),
          err instanceof Error
            ? err.message
            : t("common.somethingWentWrong"),
        );
      }
    })();
  };

  const handleLogin = async () => {
    setError(null);

    if (!auth) {
      setError(t("auth.login.schoolNotReady"));
      return;
    }

    if (!email || !password) {
      setError(t("auth.login.enterEmailPassword"));
      return;
    }

    if (!validateEmail(email)) {
      setError(t("auth.login.invalidEmail"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth.login.passwordMin"));
      return;
    }

    if (selectedSchool?.id && selectedSchool.id !== "default") {
      authLog("login:registryCheck:start", { schoolId: selectedSchool.id });
      const registryEntry = await withTimeout(
        getSchoolRegistryEntry(selectedSchool.id),
        12_000,
        "School registry check",
      );
      authLog("login:registryCheck:done", { found: Boolean(registryEntry) });
      if (!registryEntry || !isSchoolEntitled(registryEntry)) {
        setError(t("common.subscriptionExpired"));
        return;
      }
    }

    setLoading(true);
    setAwaitingProfile(true);
    authLog("login:signIn:start");

    try {
      await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      authLog("login:signIn:done");
    } catch (err) {
      setAwaitingProfile(false);
      let message = t("auth.login.loginFailed");

      if (err instanceof Error) {
        if (err.message.includes("invalid-email")) {
          message = t("auth.login.invalidEmailAuth");
        } else if (err.message.includes("user-not-found")) {
          message = t("auth.login.userNotFound");
        } else if (err.message.includes("wrong-password")) {
          message = t("auth.login.wrongPassword");
        } else if (err.message.includes("too-many-requests")) {
          message = t("auth.login.tooManyRequests");
        } else {
          message = err.message;
        }
      }

      setError(message);
      setLoading(false);
    }
  };

  const busy = loading || awaitingProfile;
  const showScanLoginCard = Platform.OS !== "web";
  const showEnterLoginCardCode = Platform.OS === "web";
  const showAlternateLogin = showScanLoginCard || showEnterLoginCardCode;

  const handleLoginCardFilled = useCallback(
    (payload: { email: string; password: string; name?: string }) => {
      setEmail(payload.email);
      setPassword(payload.password);
      setError(null);
      showSuccessAlert(t("common.success"), t("auth.login.scanCardFilled"));
    },
    [t],
  );

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      showErrorAlert(t("common.error"), t("auth.login.enterEmailPassword"));
      return;
    }

    if (!validateEmail(resetEmail)) {
      showErrorAlert(t("common.error"), t("auth.login.invalidEmail"));
      return;
    }

    setResetLoading(true);

    try {
      await requestSchoolPasswordResetHelp(resetEmail);
      showSuccessAlert(t("common.success"), t("auth.login.resetRequestSent"));
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("auth.login.resetFailed");
      showErrorAlert(t("common.error"), message);
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotPassword = () => {
    if (resetLoading) return;
    setShowForgotPassword(false);
    setResetEmail("");
  };

  const topActions = (
    <View style={styles.topActionsRowInner}>
      <TouchableOpacity
        style={styles.topActionLink}
        onPress={handleChangeSchool}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t("common.back")}
      >
        <Ionicons name="arrow-back" size={16} color={theme.primaryColor} />
        <Text style={[styles.topActionLinkText, { color: theme.primaryColor }]}>
          {t("common.back")}
        </Text>
      </TouchableOpacity>
      <AuthAboutLink color={theme.primaryColor} />
    </View>
  );

  return (
    <View style={[styles.background, WEB_PAGE_ROOT_STYLE]}>
      <ScreenBackgroundLayer />
      <StatusBar style="dark" />
        <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : Platform.OS === "android"
              ? "height"
              : undefined
        }
      >
        {!layout.isWeb ? (
          <View
            style={[
              styles.topActionsRow,
              {
                top: insets.top + 8,
                paddingHorizontal: 16,
              },
            ]}
          >
            {topActions}
          </View>
        ) : null}
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            webAuthContentStyle(),
            layout.isWeb ? styles.webScrollContent : null,
            {
              paddingTop:
                insets.top + (layout.isWeb ? (layout.isCompactWeb ? 16 : 24) : 56),
              paddingBottom: layout.isWeb
                ? insets.bottom + 56
                : copyrightFooterInset(insets.bottom),
              paddingHorizontal: layout.isCompactWeb ? 16 : 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <WebPageCard style={layout.isWeb ? styles.webCard : undefined}>
            {layout.isWeb ? (
              <View style={styles.cardTopActions}>{topActions}</View>
            ) : null}
            <View style={styles.header}>
              <Pressable
                focusable={false}
                onHoverIn={() => {
                  if (layout.isWeb) setLogoHovered(true);
                }}
                onHoverOut={() => {
                  setLogoHovered(false);
                  setLogoTilt({ x: 0, y: 0 });
                }}
                // RN Web pointer tracking for cursor-follow tilt
                {...(Platform.OS === "web"
                  ? ({
                      onMouseMove: (event: {
                        nativeEvent: { locationX?: number; locationY?: number };
                      }) => {
                        const x = event.nativeEvent.locationX ?? logoSize / 2;
                        const y = event.nativeEvent.locationY ?? logoSize / 2;
                        const nx = Math.max(
                          -1,
                          Math.min(1, (x / logoSize) * 2 - 1),
                        );
                        const ny = Math.max(
                          -1,
                          Math.min(1, (y / logoSize) * 2 - 1),
                        );
                        setLogoTilt({ x: nx, y: ny });
                      },
                    } as object)
                  : null)}
                style={[
                  styles.logoStage,
                  {
                    width: logoSize,
                    height: logoSize,
                    borderRadius: logoSize / 2,
                    ...(Platform.OS === "web"
                      ? ({
                          cursor: "pointer",
                          perspective: 600,
                        } as object)
                      : null),
                  },
                ]}
              >
                <View
                  style={[
                    styles.logoMotion,
                    {
                      width: logoSize,
                      height: logoSize,
                      borderRadius: logoSize / 2,
                      transform: [
                        { perspective: 600 },
                        {
                          scale: logoHovered ? 1.14 : 1,
                        },
                        {
                          translateX: logoHovered ? logoTilt.x * 10 : 0,
                        },
                        {
                          translateY: logoHovered ? logoTilt.y * 10 : 0,
                        },
                        {
                          rotateY: `${logoHovered ? logoTilt.x * 12 : 0}deg`,
                        },
                        {
                          rotateX: `${logoHovered ? -logoTilt.y * 12 : 0}deg`,
                        },
                      ],
                      ...(Platform.OS === "web"
                        ? ({
                            transitionProperty: logoHovered
                              ? "box-shadow"
                              : "transform, box-shadow",
                            transitionDuration: logoHovered ? "60ms" : "220ms",
                            transitionTimingFunction: "ease-out",
                            boxShadow: logoHovered
                              ? `0 18px 36px ${theme.primaryColor}40, 0 6px 14px rgba(15,23,42,0.12)`
                              : `0 8px 20px ${theme.primaryColor}22`,
                          } as object)
                        : null),
                    },
                  ]}
                >
                  {selectedSchool?.logoUrl ? (
                    <Image
                      source={{ uri: selectedSchool.logoUrl }}
                      style={[
                        styles.schoolLogo,
                        {
                          width: logoSize,
                          height: logoSize,
                          borderRadius: logoSize / 2,
                        },
                      ]}
                      resizeMode="contain"
                      accessibilityRole="image"
                      accessibilityLabel={selectedSchool.name}
                    />
                  ) : (
                    <AppLogo size={logoSize} />
                  )}
                </View>
              </Pressable>
              <Text style={styles.title}>{t("auth.login.title")}</Text>
              <Text style={styles.subtitle}>{t("auth.login.subtitle")}</Text>

              {selectedSchool ? (
                <Pressable
                  onHoverIn={() => setSchoolPillHovered(true)}
                  onHoverOut={() => setSchoolPillHovered(false)}
                  style={[
                    styles.schoolPill,
                    {
                      backgroundColor: schoolPillHovered
                        ? theme.accentColor
                        : theme.primaryColor,
                      borderColor: schoolPillHovered
                        ? theme.accentColor
                        : theme.primaryColor,
                      ...(Platform.OS === "web"
                        ? ({
                            cursor: "default",
                            transitionProperty: "background-color, border-color, box-shadow",
                            transitionDuration: "160ms",
                            transitionTimingFunction: "ease-out",
                            boxShadow: schoolPillHovered
                              ? `0 8px 20px ${theme.accentColor}55`
                              : `0 4px 14px ${theme.primaryColor}40`,
                          } as object)
                        : null),
                    },
                  ]}
                >
                  <Ionicons name="business-outline" size={16} color="#FFFFFF" />
                  <Text
                    style={[styles.schoolPillText, { color: "#FFFFFF" }]}
                    numberOfLines={1}
                  >
                    {selectedSchool.name}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <View
              style={[
                styles.formBody,
                layout.isWeb ? styles.formBodyWeb : styles.formBodyNative,
              ]}
            >
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color="#B91C1C" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <AuthFormField
                testID="login-email"
                label={t("auth.login.email")}
                icon="mail-outline"
                primaryColor={theme.primaryColor}
                placeholder={t("auth.login.email")}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!busy}
              />

              <View style={styles.passwordBlock}>
                <AuthFormField
                  testID="login-password"
                  label={t("auth.login.password")}
                  icon="lock-closed-outline"
                  isPassword
                  primaryColor={theme.primaryColor}
                  placeholder={t("auth.login.password")}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                  editable={!busy}
                  containerStyle={styles.passwordField}
                />
                <TouchableOpacity
                  style={styles.forgotPasswordLink}
                  onPress={() => setShowForgotPassword(true)}
                  disabled={busy}
                >
                  <Text style={[styles.forgotPasswordText, { color: theme.primaryColor }]}>
                    {t("auth.login.forgotPassword")}
                  </Text>
                </TouchableOpacity>
              </View>

              <Pressable
                testID="login-submit"
                accessibilityRole="button"
                accessibilityState={{ disabled: busy }}
                onPress={handleLogin}
                disabled={busy}
                onHoverIn={() => setSignInHovered(true)}
                onHoverOut={() => setSignInHovered(false)}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: signInHovered
                      ? theme.accentColor
                      : theme.primaryColor,
                    transform: [
                      {
                        scale:
                          busy
                            ? 1
                            : pressed
                              ? 0.98
                              : signInHovered
                                ? 1.03
                                : 1,
                      },
                    ],
                    ...(Platform.OS === "web"
                      ? ({
                          cursor: busy ? "default" : "pointer",
                          transitionProperty:
                            "transform, box-shadow, background-color",
                          transitionDuration: "180ms",
                          transitionTimingFunction: "ease-out",
                          boxShadow: signInHovered
                            ? `0 14px 32px ${theme.accentColor}66`
                            : `0 8px 24px ${theme.primaryColor}40`,
                        } as object)
                      : {
                          shadowColor: signInHovered
                            ? theme.accentColor
                            : theme.primaryColor,
                        }),
                  },
                  busy && styles.buttonDisabled,
                ]}
              >
                {busy ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>
                      {t("auth.login.signIn")}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </>
                )}
              </Pressable>

              {showAlternateLogin ? (
                <>
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>
                      {t("auth.login.orDivider")}
                    </Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {showEnterLoginCardCode ? (
                    <TouchableOpacity
                      style={[
                        styles.secondaryButton,
                        busy && styles.buttonDisabled,
                      ]}
                      onPress={() => setShowLoginCardCode(true)}
                      disabled={busy}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="keypad-outline"
                        size={18}
                        color="#475569"
                      />
                      <Text style={styles.secondaryButtonText}>
                        {t("auth.login.enterCardCode")}
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  {showScanLoginCard ? (
                    <TouchableOpacity
                      style={[
                        styles.secondaryButton,
                        busy && styles.buttonDisabled,
                      ]}
                      onPress={() => setShowLoginCardScanner(true)}
                      disabled={busy}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="qr-code-outline"
                        size={18}
                        color="#475569"
                      />
                      <Text style={styles.secondaryButtonText}>
                        {t("auth.login.scanCard")}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              ) : null}

              <Text style={styles.infoText}>
                {t("auth.login.notRegisteredHint")}
              </Text>
            </View>
          </WebPageCard>
        </ScrollView>
      </KeyboardAvoidingView>

      {!busy ? (
        <Text
          style={[
            styles.copyright,
            { bottom: copyrightBarBottom(insets.bottom) },
          ]}
          pointerEvents="none"
          accessibilityRole="text"
        >
          {APP_COPYRIGHT}
        </Text>
      ) : null}

      <ForgotPasswordModal
        visible={showForgotPassword}
        email={resetEmail}
        loading={resetLoading}
        onEmailChange={setResetEmail}
        onClose={closeForgotPassword}
        onSubmit={handleForgotPassword}
      />

      <LoginCardScannerModal
        visible={showLoginCardScanner}
        onClose={() => setShowLoginCardScanner(false)}
        onFilled={handleLoginCardFilled}
      />

      <LoginCardCodeModal
        visible={showLoginCardCode}
        onClose={() => setShowLoginCardCode(false)}
        onFilled={handleLoginCardFilled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },

  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  topActionsRowInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
  },

  cardTopActions: {
    marginBottom: 12,
  },

  topActionsRow: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
  },

  topActionLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.85)",
    flexShrink: 1,
    maxWidth: "58%",
  },

  topActionLinkText: {
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  webScrollContent: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
  },

  webCard: {
    width: "100%",
    maxWidth: 760,
    paddingHorizontal: 48,
    paddingVertical: 44,
  },

  header: {
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.3,
  },

  subtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
    maxWidth: 420,
  },

  schoolLogo: {
    backgroundColor: "#EFF6FF",
  },
  logoStage: {
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  logoMotion: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  schoolPill: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    maxWidth: "100%",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },

  schoolPillText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
  },

  formBody: {
    width: "100%",
  },

  formBodyWeb: {
    paddingTop: 4,
  },

  formBodyNative: {
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.85)",
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },

  errorText: {
    flex: 1,
    color: "#B91C1C",
    fontSize: 14,
    lineHeight: 20,
  },

  passwordBlock: {
    marginBottom: 4,
  },

  passwordField: {
    marginBottom: 0,
  },

  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginBottom: 4,
  },

  forgotPasswordText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 14,
    minHeight: 54,
    marginTop: 20,
    ...(Platform.OS === "web"
      ? ({
          boxShadow: "0 8px 24px rgba(37, 99, 235, 0.28)",
          willChange: "transform",
        } as object)
      : {
          shadowColor: "#2563EB",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.22,
          shadowRadius: 6,
          elevation: 3,
        }),
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },

  dividerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    marginBottom: 8,
  },

  secondaryButtonText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 14,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  infoText: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },

  copyright: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(12, 74, 110, 0.75)",
    letterSpacing: 0.3,
    zIndex: 2,
  },
});
