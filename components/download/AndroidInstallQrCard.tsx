import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { ANDROID_INSTALL_URL } from "../../src/constants/appInstall";
import { showErrorAlert } from "../../src/utils/confirmDialog";

const isWeb = Platform.OS === "web";

export function AndroidInstallQrCard() {
  const { t } = useTranslation();

  const openInstallLink = async () => {
    try {
      const supported = await Linking.canOpenURL(ANDROID_INSTALL_URL);
      if (!supported) {
        showErrorAlert(t("common.error"), t("download.openFailed"));
        return;
      }
      await Linking.openURL(ANDROID_INSTALL_URL);
    } catch {
      showErrorAlert(t("common.error"), t("download.openFailed"));
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="phone-portrait-outline" size={22} color="#1E3A8A" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t("download.androidQrTitle")}</Text>
          <Text style={styles.hint}>{t("download.androidQrHint")}</Text>
        </View>
      </View>

      <View style={styles.qrWrap}>
        <QRCode value={ANDROID_INSTALL_URL} size={200} />
      </View>

      <Text style={styles.scanSteps}>{t("download.androidQrSteps")}</Text>

      {isWeb ? (
        <TouchableOpacity style={styles.linkBtn} onPress={() => void openInstallLink()}>
          <Text style={styles.linkBtnText}>{t("download.androidQrOpenLink")}</Text>
          <Ionicons name="open-outline" size={16} color="#1E3A8A" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    padding: 20,
    alignItems: "center",
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    alignSelf: "stretch",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },
  qrWrap: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  scanSteps: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 320,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  linkBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A8A",
  },
});
