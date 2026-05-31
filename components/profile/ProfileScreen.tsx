import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserAvatar } from "../common/UserAvatar";
import { PasswordInput } from "../PasswordInput";
import { AuthContext } from "../../src/context/authContext";
import {
  getProfilePhotoErrorKey,
  pickProfileImageUri,
  removeProfilePhoto,
  uploadProfilePhoto,
} from "../../src/services/profilePhoto";
import {
  changeUserEmail,
  changeUserPassword,
  mapAuthError,
  updateProfileName,
} from "../../src/services/userProfile";
import { canUploadProfilePhoto } from "../../src/utils/userAvatar";

type ProfileScreenProps = {
  roleLabel?: string;
  showBack?: boolean;
};

function roleLabelKey(role: string | undefined): string | null {
  switch (role) {
    case "student":
      return "profile.roleStudent";
    case "teacher":
      return "profile.roleTeacher";
    case "parent":
      return "profile.roleParent";
    case "admin":
      return "profile.roleAdmin";
    case "super-admin":
      return "profile.roleSuperAdmin";
    default:
      return null;
  }
}

export function ProfileScreen({ roleLabel, showBack = false }: ProfileScreenProps) {
  const { t } = useTranslation();
  const { user, userData, role, logout, refreshUserProfile } =
    useContext(AuthContext);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(userData?.name || "");
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const canEditPhoto = canUploadProfilePhoto(role);
  const photoURL =
    typeof userData?.photoURL === "string" && userData.photoURL.trim()
      ? userData.photoURL.trim()
      : null;

  const roleKey = roleLabelKey(role);
  const displayRole =
    roleLabel ||
    (roleKey ? t(roleKey) : role ? String(role) : t("common.unknown"));

  const loginEmail = user?.email || userData?.email || "—";

  useEffect(() => {
    setName(userData?.name || "");
  }, [userData?.name]);

  const saveName = async () => {
    setSavingName(true);
    try {
      await updateProfileName(name);
      await refreshUserProfile?.();
      Alert.alert(t("common.success"), t("profile.savedName"));
    } catch (err) {
      Alert.alert(t("common.error"), mapAuthError(err, "Could not update name."));
    } finally {
      setSavingName(false);
    }
  };

  const saveEmail = async () => {
    if (!newEmail.trim()) {
      Alert.alert(t("profile.emailRequired"));
      return;
    }
    if (!emailPassword) {
      Alert.alert(t("profile.passwordRequired"));
      return;
    }
    setSavingEmail(true);
    try {
      await changeUserEmail(newEmail, emailPassword);
      await refreshUserProfile?.();
      setNewEmail("");
      setEmailPassword("");
      Alert.alert(t("common.success"), t("profile.savedEmail"));
    } catch (err) {
      Alert.alert(t("common.error"), mapAuthError(err, "Could not change email."));
    } finally {
      setSavingEmail(false);
    }
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert(t("common.required"));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t("profile.mismatch"));
      return;
    }
    setSavingPassword(true);
    try {
      await changeUserPassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert(t("common.success"), t("profile.savedPassword"));
    } catch (err) {
      Alert.alert(t("common.error"), mapAuthError(err, "Could not change password."));
    } finally {
      setSavingPassword(false);
    }
  };

  const mapPhotoError = (err: unknown): string => {
    return t(getProfilePhotoErrorKey(err));
  };

  const handleChangePhoto = async () => {
    setUploadingPhoto(true);
    try {
      const uri = await pickProfileImageUri();
      if (!uri) return;
      await uploadProfilePhoto(uri);
      await refreshUserProfile?.();
      Alert.alert(t("common.success"), t("profile.photoSaved"));
    } catch (err) {
      Alert.alert(t("common.error"), mapPhotoError(err));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(t("profile.removePhotoTitle"), t("profile.removePhotoConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.removePhoto"),
        style: "destructive",
        onPress: async () => {
          setUploadingPhoto(true);
          try {
            await removeProfilePhoto();
            await refreshUserProfile?.();
            Alert.alert(t("common.success"), t("profile.photoRemoved"));
          } catch {
            Alert.alert(t("common.error"), t("profile.photoUploadFailed"));
          } finally {
            setUploadingPhoto(false);
          }
        },
      },
    ]);
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
          } catch {
            Alert.alert(t("common.error"), t("common.somethingWentWrong"));
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.fixedHero,
          {
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
          },
        ]}
      >
        {showBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={24} color="#1E40AF" />
            <Text style={styles.backText}>{t("common.back")}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.hero}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={canEditPhoto ? handleChangePhoto : undefined}
            disabled={!canEditPhoto || uploadingPhoto}
            activeOpacity={canEditPhoto ? 0.85 : 1}
          >
            <UserAvatar
              name={userData?.name}
              email={loginEmail !== "—" ? loginEmail : undefined}
              photoURL={photoURL}
              size={72}
              textColor="#FFFFFF"
              backgroundColor="#2563EB"
            />
            {canEditPhoto ? (
              <View style={styles.avatarBadge}>
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                )}
              </View>
            ) : null}
          </TouchableOpacity>
          {canEditPhoto ? (
            <View style={styles.photoActions}>
              <TouchableOpacity
                style={styles.photoActionBtn}
                onPress={handleChangePhoto}
                disabled={uploadingPhoto}
              >
                <Text style={styles.photoActionText}>{t("profile.changePhoto")}</Text>
              </TouchableOpacity>
              {photoURL ? (
                <TouchableOpacity
                  style={styles.photoActionBtnOutline}
                  onPress={handleRemovePhoto}
                  disabled={uploadingPhoto}
                >
                  <Text style={styles.photoActionTextOutline}>
                    {t("profile.removePhoto")}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
          <Text style={styles.heroName} numberOfLines={2}>
            {userData?.name || t("profile.yourProfile")}
          </Text>
          <Text style={styles.heroEmail} numberOfLines={1}>
            {loginEmail}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{displayRole}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      <View style={[styles.card, styles.firstCard]}>
        <Text style={styles.cardTitle}>{t("profile.displayName")}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          editable={!savingName}
        />
        <TouchableOpacity
          style={[styles.primaryBtn, savingName && styles.btnDisabled]}
          onPress={saveName}
          disabled={savingName}
        >
          {savingName ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>{t("profile.saveName")}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("profile.changeEmail")}</Text>
        <Text style={styles.cardHint}>{t("profile.changeEmailHint")}</Text>
        <Text style={styles.label}>{t("profile.newEmail")}</Text>
        <TextInput
          style={styles.input}
          value={newEmail}
          onChangeText={setNewEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder={loginEmail !== "—" ? loginEmail : t("profile.newEmail")}
          editable={!savingEmail}
        />
        <Text style={styles.label}>{t("profile.currentPassword")}</Text>
        <PasswordInput
          inputStyle={styles.input}
          value={emailPassword}
          onChangeText={setEmailPassword}
          placeholder={t("profile.currentPassword")}
          editable={!savingEmail}
        />
        <TouchableOpacity
          style={[styles.primaryBtn, savingEmail && styles.btnDisabled]}
          onPress={saveEmail}
          disabled={savingEmail}
        >
          {savingEmail ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>{t("profile.updateEmail")}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("profile.changePassword")}</Text>
        <Text style={styles.cardHint}>{t("profile.changePasswordHint")}</Text>
        <Text style={styles.label}>{t("profile.currentPasswordLabel")}</Text>
        <PasswordInput
          inputStyle={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder={t("profile.currentPasswordLabel")}
          editable={!savingPassword}
        />
        <Text style={styles.label}>{t("profile.newPassword")}</Text>
        <PasswordInput
          inputStyle={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder={t("profile.newPassword")}
          editable={!savingPassword}
        />
        <Text style={styles.label}>{t("profile.confirmPassword")}</Text>
        <PasswordInput
          inputStyle={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t("profile.confirmPassword")}
          editable={!savingPassword}
        />
        <TouchableOpacity
          style={[styles.primaryBtn, savingPassword && styles.btnDisabled]}
          onPress={savePassword}
          disabled={savingPassword}
        >
          {savingPassword ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>{t("profile.updatePassword")}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color="#64748B" />
        <Text style={styles.infoText}>{t("profile.forgotHint")}</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.logoutBtnText}>{t("profile.signOut")}</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  fixedHero: {
    backgroundColor: "transparent",
    paddingBottom: 16,
  },
  scrollBody: { flex: 1 },
  firstCard: { marginTop: 16 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  backText: { color: "#1E40AF", fontWeight: "700", fontSize: 16 },
  hero: {
    alignItems: "center",
  },
  avatarWrap: {
    marginBottom: 8,
    position: "relative",
  },
  avatarBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  photoActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  photoActionBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  photoActionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  photoActionBtnOutline: {
    borderWidth: 1,
    borderColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  photoActionTextOutline: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 12,
  },
  heroName: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  heroEmail: { fontSize: 14, color: "#64748B", marginTop: 4 },
  roleBadge: {
    marginTop: 10,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleBadgeText: { color: "#2563EB", fontWeight: "700", fontSize: 12 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#0F172A", marginBottom: 6 },
  cardHint: { fontSize: 13, color: "#64748B", lineHeight: 18, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  btnDisabled: { opacity: 0.6 },
  infoCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoText: { flex: 1, fontSize: 13, color: "#64748B", lineHeight: 18 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 8,
  },
  logoutBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});
