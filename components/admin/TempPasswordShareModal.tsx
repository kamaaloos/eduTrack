import { Ionicons } from "@expo/vector-icons";
import Barcode from "react-native-barcode-svg";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import type { UserData, UserRole } from "../../hooks/useAdminUsers";
import { useSchoolContext } from "../../src/context/schoolContext";
import { shareHtmlAsPdf } from "../../src/services/pdfShare";
import { printHtmlOnWeb } from "../../src/utils/webFileDownload";
import { showErrorAlert } from "../../src/utils/confirmDialog";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import {
  buildTempPasswordPayload,
  buildTempPasswordPrintHtml,
  encodeTempPasswordPayload,
} from "../../src/utils/tempPasswordCard";

const isWeb = Platform.OS === "web";

type TempPasswordShareModalProps = {
  visible: boolean;
  user: UserData | null;
  role: UserRole;
  tempPassword: string;
  onClose: () => void;
};

export function TempPasswordShareModal({
  visible,
  user,
  role,
  tempPassword,
  onClose,
}: TempPasswordShareModalProps) {
  const { t } = useTranslation();
  const { selectedSchool } = useSchoolContext();
  const [printing, setPrinting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const payload = useMemo(() => {
    if (!user?.email) return null;
    return buildTempPasswordPayload({
      email: user.email,
      password: tempPassword,
      name: user.name,
    });
  }, [user, tempPassword]);

  const qrValue = payload ? encodeTempPasswordPayload(payload) : "";

  const handlePrint = async () => {
    if (!user?.email) return;
    setPrinting(true);
    try {
      const html = await buildTempPasswordPrintHtml({
        schoolName: selectedSchool?.name,
        userName: user.name || user.email,
        email: user.email,
        password: tempPassword,
        roleLabel: t(`common.${role}`),
      });
      if (Platform.OS === "web") {
        await printHtmlOnWeb(html);
      } else {
        await shareHtmlAsPdf(
          html,
          `${user.name || user.email}-temp-password.pdf`,
          t("admin.tempPasswordShareTitle"),
        );
      }
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.tempPasswordPrintFailed"),
      );
    } finally {
      setPrinting(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === "web" ? "fade" : "slide"}
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{t("admin.tempPasswordShareTitle")}</Text>
              <Text style={styles.subtitle}>{t("admin.tempPasswordShareSubtitle")}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityLabel={t("common.close")}
            >
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>{t("admin.fullNameLabel")}</Text>
            <Text style={styles.value}>{user.name || t("common.unnamed")}</Text>

            <Text style={styles.label}>{t("admin.emailProfileLabel")}</Text>
            <Text style={styles.value}>{user.email || "—"}</Text>

            <Text style={styles.label}>{t("admin.setPasswordNew")}</Text>
            <View style={styles.passwordRow}>
              <Text style={styles.passwordValue}>
                {showPassword ? tempPassword : "••••••••"}
              </Text>
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                accessibilityRole="button"
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#2563EB"
                />
              </TouchableOpacity>
            </View>

            {qrValue ? (
              <View style={styles.codeBlock}>
                <Text style={styles.codeTitle}>{t("admin.tempPasswordQrLabel")}</Text>
                <View style={styles.qrWrap}>
                  <QRCode value={qrValue} size={180} />
                </View>
                <Text style={styles.codeHint}>{t("admin.tempPasswordQrHint")}</Text>
              </View>
            ) : null}

            {tempPassword ? (
              <View style={styles.codeBlock}>
                <Text style={styles.codeTitle}>{t("admin.tempPasswordBarcodeLabel")}</Text>
                <View style={styles.barcodeWrap}>
                  <Barcode
                    value={tempPassword}
                    format="CODE128"
                    singleBarWidth={2}
                    maxWidth={isWeb ? 320 : 280}
                    height={72}
                  />
                </View>
                <Text style={styles.codeHint}>{t("admin.tempPasswordBarcodeHint")}</Text>
              </View>
            ) : null}

            <Text style={styles.securityNote}>{t("admin.tempPasswordSecurityNote")}</Text>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onClose}
              disabled={printing}
            >
              <Text style={styles.secondaryBtnText}>{t("common.close")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, printing && styles.btnDisabled]}
              onPress={() => void handlePrint()}
              disabled={printing}
            >
              {printing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {Platform.OS === "web"
                    ? t("admin.tempPasswordPrint")
                    : t("admin.tempPasswordSavePdf")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: isWeb ? "center" : "flex-end",
    alignItems: isWeb ? "center" : "stretch",
    padding: isWeb ? 24 : 0,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: isWeb ? 16 : undefined,
    borderTopLeftRadius: isWeb ? 16 : 20,
    borderTopRightRadius: isWeb ? 16 : 20,
    width: isWeb ? ("100%" as const) : undefined,
    maxWidth: isWeb ? 520 : undefined,
    maxHeight: isWeb ? "90%" : "92%",
    padding: 20,
    ...(isWeb
      ? ({
          boxShadow: "0 12px 40px rgba(15, 23, 42, 0.2)",
        } as object)
      : null),
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  headerText: { flex: 1, minWidth: 0 },
  title: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 4, lineHeight: 18 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingBottom: 8 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    marginTop: 10,
  },
  value: { fontSize: 16, color: "#0F172A", marginTop: 4 },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
  },
  passwordValue: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#1E3A8A",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  codeBlock: {
    marginTop: 18,
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
  },
  codeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 10,
  },
  qrWrap: {
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  barcodeWrap: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  codeHint: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 17,
  },
  securityNote: {
    marginTop: 16,
    fontSize: 12,
    color: "#B45309",
    lineHeight: 18,
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  secondaryBtnText: { fontWeight: "700", color: "#475569" },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  primaryBtnText: { fontWeight: "700", color: "#FFFFFF" },
  btnDisabled: { opacity: 0.65 },
});
