import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { parseTempPasswordQrData } from "../../src/utils/tempPasswordCard";
import { showErrorAlert } from "../../src/utils/confirmDialog";

type LoginCardScannerModalProps = {
  visible: boolean;
  onClose: () => void;
  onFilled: (payload: { email: string; password: string; name?: string }) => void;
};

export function LoginCardScannerModal({
  visible,
  onClose,
  onFilled,
}: LoginCardScannerModalProps) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const handledRef = useRef(false);

  useEffect(() => {
    if (visible) {
      handledRef.current = false;
    }
  }, [visible]);

  const handleBarcode = ({ data }: { data: string }) => {
    if (handledRef.current) return;

    const payload = parseTempPasswordQrData(data);
    if (!payload) {
      showErrorAlert(t("common.error"), t("auth.login.scanCardInvalid"));
      return;
    }

    handledRef.current = true;
    onFilled({
      email: payload.email,
      password: payload.password,
      name: payload.name,
    });
    onClose();
  };

  if (Platform.OS === "web") {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("auth.login.scanCardTitle")}</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityLabel={t("common.close")}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>{t("auth.login.scanCardHint")}</Text>

        {!permission ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#FFFFFF" size="large" />
          </View>
        ) : !permission.granted ? (
          <View style={styles.centered}>
            <Text style={styles.permissionText}>
              {t("auth.login.scanCardPermission")}
            </Text>
            <TouchableOpacity
              style={styles.permissionBtn}
              onPress={() => void requestPermission()}
            >
              <Text style={styles.permissionBtnText}>
                {t("auth.login.scanCardAllowCamera")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraWrap}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={handledRef.current ? undefined : handleBarcode}
            />
            <View style={styles.frameOverlay} pointerEvents="none">
              <View style={styles.frame} />
            </View>
          </View>
        )}

        <Pressable style={styles.cancelRow} onPress={onClose}>
          <Text style={styles.cancelText}>{t("common.cancel")}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  permissionText: {
    color: "#E2E8F0",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  permissionBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  permissionBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  cameraWrap: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: 240,
    height: 240,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.85)",
    backgroundColor: "transparent",
  },
  cancelRow: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelText: {
    color: "#93C5FD",
    fontWeight: "700",
    fontSize: 16,
  },
});
