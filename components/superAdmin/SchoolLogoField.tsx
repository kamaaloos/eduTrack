import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getSchoolLogoErrorKey,
  pickSchoolLogoUri,
  uploadSchoolLogo,
} from "../../src/services/schoolLogo";
import { updateSchoolLogoUrl } from "../../src/services/schoolRegistryAdmin";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";

type SchoolLogoFieldProps = {
  schoolId?: string;
  logoUrl: string;
  pendingLogoUri: string | null;
  onLogoUrlChange: (url: string) => void;
  onPendingLogoUriChange: (uri: string | null) => void;
  disabled?: boolean;
};

export function SchoolLogoField({
  schoolId,
  logoUrl,
  pendingLogoUri,
  onLogoUrlChange,
  onPendingLogoUriChange,
  disabled = false,
}: SchoolLogoFieldProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const previewUri = pendingLogoUri || logoUrl.trim() || null;

  const mapLogoError = (err: unknown): string => t(getSchoolLogoErrorKey(err));

  const handlePickAndUpload = async () => {
    setUploading(true);
    try {
      const uri = await pickSchoolLogoUri();
      if (!uri) return;

      if (schoolId) {
        const downloadUrl = await uploadSchoolLogo(uri, schoolId);
        await updateSchoolLogoUrl(schoolId, downloadUrl);
        onLogoUrlChange(downloadUrl);
        onPendingLogoUriChange(null);
        Alert.alert(t("common.success"), t("superAdmin.logoUploaded"));
        return;
      }

      onPendingLogoUriChange(uri);
      Alert.alert(t("common.success"), t("superAdmin.logoPendingSave"));
    } catch (err) {
      Alert.alert(t("common.error"), mapLogoError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    Alert.alert(t("superAdmin.logoRemoveTitle"), t("superAdmin.logoRemoveConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.remove"),
        style: "destructive",
        onPress: () => {
          onPendingLogoUriChange(null);
          onLogoUrlChange("");
        },
      },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t("superAdmin.schoolLogoUrl")}</Text>

      {previewUri ? (
        <View style={styles.previewRow}>
          <Image source={{ uri: previewUri }} style={styles.preview} />
          <View style={styles.previewMeta}>
            {pendingLogoUri && !schoolId ? (
              <Text style={styles.pendingText}>{t("superAdmin.logoPendingSave")}</Text>
            ) : null}
            <TouchableOpacity
              onPress={handleClear}
              disabled={disabled}
              accessibilityRole="button"
            >
              <Text style={styles.removeText}>{t("superAdmin.logoRemove")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="image-outline" size={28} color="#94A3B8" />
          <Text style={styles.placeholderText}>{t("superAdmin.logoEmpty")}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.uploadButton, (disabled || uploading) && styles.uploadButtonDisabled]}
        onPress={() => void handlePickAndUpload()}
        disabled={disabled || uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#1E3A8A" size="small" />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={18} color="#1E3A8A" />
            <Text style={styles.uploadButtonText}>{t("superAdmin.logoUpload")}</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.orText}>{t("superAdmin.logoOrPasteUrl")}</Text>
      <TextInput
        style={styles.input}
        value={logoUrl}
        onChangeText={(value) => {
          onLogoUrlChange(value);
          if (value.trim()) {
            onPendingLogoUriChange(null);
          }
        }}
        placeholder={t("superAdmin.schoolLogoUrlPlaceholder")}
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!disabled}
      />
      <Text style={styles.hint}>{t("superAdmin.schoolLogoUrlHint")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    marginTop: 4,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  preview: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },
  previewMeta: {
    flex: 1,
    gap: 6,
  },
  pendingText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#B45309",
    fontWeight: "600",
  },
  removeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B91C1C",
  },
  placeholder: {
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginBottom: 12,
    backgroundColor: "#F8FAFC",
  },
  placeholderText: {
    fontSize: 12,
    color: "#94A3B8",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: "#1E3A8A",
    fontSize: 15,
    fontWeight: "700",
  },
  orText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginBottom: 8,
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#94A3B8",
  },
});
