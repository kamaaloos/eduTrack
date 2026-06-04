import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SelectChips, SelectList, type ChipOption } from "../teachers/SelectChips";
import { sendDirectMessage } from "../../src/services/directMessages";
import { getParentIdsForStudent } from "../../src/services/notificationTargets";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/services/firebase";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";
import { platformShadow } from "../../src/utils/platformShadow";

export type DirectMessageRecipientRole = "student" | "parent";

type DirectMessageCardProps = {
  classOptions: ChipOption[];
  selectedClassId: string;
  onClassChange: (classId: string) => void;
  students: ChipOption[];
  loadingStudents?: boolean;
  senderRole: "admin" | "teacher";
  senderId?: string;
  senderName?: string;
  hideClassPicker?: boolean;
};

async function loadParentOptions(studentId: string): Promise<ChipOption[]> {
  const parentIds = await getParentIdsForStudent(studentId);
  if (parentIds.length === 0) return [];

  const options = await Promise.all(
    parentIds.map(async (parentId) => {
      try {
        const snap = await getDoc(doc(db, "users", parentId));
        const data = snap.data();
        const name =
          (typeof data?.name === "string" && data.name.trim()) ||
          (typeof data?.email === "string" && data.email.trim()) ||
          parentId.slice(0, 8);
        return { value: parentId, label: name };
      } catch {
        return { value: parentId, label: parentId.slice(0, 8) };
      }
    }),
  );

  return options;
}

export function DirectMessageCard({
  classOptions,
  selectedClassId,
  onClassChange,
  students,
  loadingStudents = false,
  senderRole,
  senderId,
  senderName,
  hideClassPicker = false,
}: DirectMessageCardProps) {
  const { t } = useTranslation();
  const [recipientRole, setRecipientRole] =
    useState<DirectMessageRecipientRole>("student");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");
  const [parentOptions, setParentOptions] = useState<ChipOption[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const recipientRoleOptions = useMemo<ChipOption[]>(
    () => [
      { value: "student", label: t("directMessage.recipientStudent") },
      { value: "parent", label: t("directMessage.recipientParent") },
    ],
    [t],
  );

  useEffect(() => {
    setSelectedStudentId("");
    setSelectedParentId("");
    setParentOptions([]);
  }, [selectedClassId]);

  useEffect(() => {
    setSelectedParentId("");
    if (recipientRole !== "parent" || !selectedStudentId) {
      setParentOptions([]);
      return;
    }

    let cancelled = false;
    setLoadingParents(true);

    void loadParentOptions(selectedStudentId)
      .then((options) => {
        if (cancelled) return;
        setParentOptions(options);
        if (options.length === 1) {
          setSelectedParentId(options[0].value);
        }
      })
      .catch(() => {
        if (!cancelled) setParentOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingParents(false);
      });

    return () => {
      cancelled = true;
    };
  }, [recipientRole, selectedStudentId]);

  const selectedStudentLabel =
    students.find((s) => s.value === selectedStudentId)?.label ?? "";

  const handleSend = async () => {
    if (!selectedClassId) {
      showErrorAlert(t("common.error"), t("directMessage.selectClass"));
      return;
    }
    if (!selectedStudentId) {
      showErrorAlert(t("common.error"), t("directMessage.selectStudent"));
      return;
    }
    if (recipientRole === "parent") {
      if (parentOptions.length === 0) {
        showErrorAlert(t("common.error"), t("directMessage.noParentLinked"));
        return;
      }
      if (!selectedParentId) {
        showErrorAlert(t("common.error"), t("directMessage.selectParent"));
        return;
      }
    }
    if (!title.trim() || !message.trim()) {
      showErrorAlert(t("common.error"), t("directMessage.missingFields"));
      return;
    }

    const recipientUserId =
      recipientRole === "student" ? selectedStudentId : selectedParentId;

    setLoading(true);
    try {
      await sendDirectMessage({
        classId: selectedClassId,
        studentId: selectedStudentId,
        studentName: selectedStudentLabel,
        recipientRole,
        recipientUserId,
        title: title.trim(),
        text: message.trim(),
        senderRole,
        senderId,
        senderName,
      });

      showSuccessAlert(t("common.success"), t("directMessage.sent"));
      setTitle("");
      setMessage("");
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("directMessage.sendFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t("directMessage.title")}</Text>
      <Text style={styles.hint}>{t("directMessage.hint")}</Text>

      {!hideClassPicker ? (
        <>
          <Text style={styles.label}>{t("directMessage.classLabel")}</Text>
          {classOptions.length === 0 ? (
            <Text style={styles.empty}>{t("directMessage.noClasses")}</Text>
          ) : (
            <SelectList
              options={classOptions}
              selectedValue={selectedClassId}
              onSelect={onClassChange}
              emptyMessage={t("directMessage.noClasses")}
            />
          )}
        </>
      ) : null}

      <Text style={styles.label}>{t("directMessage.recipientType")}</Text>
      <SelectChips
        options={recipientRoleOptions}
        selectedValue={recipientRole}
        onSelect={(value) =>
          setRecipientRole(value as DirectMessageRecipientRole)
        }
      />

      <Text style={styles.label}>{t("directMessage.studentLabel")}</Text>
      {loadingStudents ? (
        <ActivityIndicator color="#1E3A8A" style={styles.loader} />
      ) : !selectedClassId ? (
        <Text style={styles.empty}>{t("directMessage.selectClassFirst")}</Text>
      ) : students.length === 0 ? (
        <Text style={styles.empty}>{t("directMessage.noStudents")}</Text>
      ) : (
        <SelectList
          options={students}
          selectedValue={selectedStudentId}
          onSelect={setSelectedStudentId}
          emptyMessage={t("directMessage.noStudents")}
        />
      )}

      {recipientRole === "parent" && selectedStudentId ? (
        <>
          <Text style={styles.label}>{t("directMessage.parentLabel")}</Text>
          {loadingParents ? (
            <ActivityIndicator color="#1E3A8A" style={styles.loader} />
          ) : parentOptions.length === 0 ? (
            <Text style={styles.empty}>{t("directMessage.noParentLinked")}</Text>
          ) : (
            <SelectList
              options={parentOptions}
              selectedValue={selectedParentId}
              onSelect={setSelectedParentId}
              emptyMessage={t("directMessage.noParentLinked")}
            />
          )}
        </>
      ) : null}

      <TextInput
        placeholder={t("directMessage.titlePlaceholder")}
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        editable={!loading}
      />

      <TextInput
        placeholder={t("directMessage.messagePlaceholder")}
        value={message}
        onChangeText={setMessage}
        style={[styles.input, styles.messageInput]}
        multiline
        textAlignVertical="top"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={() => void handleSend()}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>{t("directMessage.send")}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    ...platformShadow("md"),
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: "#666",
    marginBottom: 14,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 4,
  },
  empty: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 12,
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
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
