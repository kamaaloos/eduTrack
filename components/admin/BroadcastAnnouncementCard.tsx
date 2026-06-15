import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../../src/context/authContext";
import { publishAnnouncementToAllClasses } from "../../src/services/adminAnnouncements";
import {
  confirmAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";
import { platformShadow } from "../../src/utils/platformShadow";
import { innerCardBorderStyle } from "../../src/constants/innerCardBorders";

interface BroadcastAnnouncementCardProps {
  classCount: number;
}

export const BroadcastAnnouncementCard: React.FC<
  BroadcastAnnouncementCardProps
> = ({ classCount }) => {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      showErrorAlert(t("common.error"), t("admin.broadcastMissingFields"));
      return;
    }

    if (classCount === 0) {
      showErrorAlert(t("common.error"), t("admin.broadcastNoClasses"));
      return;
    }

    const confirmed = await confirmAction(
      t("admin.broadcastConfirmTitle"),
      t("admin.broadcastConfirmMessage", { count: classCount }),
      t("common.send"),
      t("common.cancel"),
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    try {
      const result = await publishAnnouncementToAllClasses({
        title: title.trim(),
        text: message.trim(),
        adminId: user?.uid,
        adminName: userData?.name ?? t("common.admin"),
      });

      const errNote =
        result.errors.length > 0
          ? t("admin.broadcastErrors", {
              errors: result.errors.slice(0, 3).join("\n"),
            })
          : "";

      showSuccessAlert(
        t("admin.announcementSent"),
        t("admin.announcementSentDetail", {
          published: result.published,
          total: result.classCount,
          errors: errNote,
        }),
      );

      if (result.published > 0) {
        setTitle("");
        setMessage("");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : t("admin.broadcastFailed");
      setError(msg);
      showErrorAlert(t("common.error"), msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        {t("admin.broadcastAnnouncement")}
      </Text>
      <Text style={styles.hint}>
        {t("admin.broadcastHint", { count: classCount })}
      </Text>

      <TextInput
        placeholder={t("admin.titlePlaceholder")}
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        editable={!loading}
      />

      <TextInput
        placeholder={t("admin.messagePlaceholder")}
        value={message}
        onChangeText={setMessage}
        style={[styles.input, styles.messageInput]}
        multiline
        textAlignVertical="top"
        editable={!loading}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[
          styles.button,
          (loading || classCount === 0) && styles.buttonDisabled,
        ]}
        onPress={() => void handleSend()}
        disabled={loading || classCount === 0}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>
            {t("admin.sendToAllClasses", { count: classCount })}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    ...innerCardBorderStyle,
    ...platformShadow("md"),
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  hint: {
    fontSize: 13,
    color: "#666",
    marginBottom: 14,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "white",
  },
  messageInput: {
    minHeight: 100,
  },
  button: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  errorText: {
    color: "#DC2626",
    marginBottom: 10,
    fontSize: 14,
  },
});
