import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SelectChips, type ChipOption } from "../teachers/SelectChips";
import { sendDirectMessage } from "../../src/services/directMessages";
import { getParentIdsForStudent } from "../../src/services/notificationTargets";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/services/firebase";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";
import { platformShadow } from "../../src/utils/platformShadow";
import { OptionPickerModal } from "./OptionPickerModal";

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

function PickerField({
  label,
  placeholder,
  value,
  disabled,
  onPress,
}: {
  label: string;
  placeholder: string;
  value: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <View style={pickerStyles.field}>
      <Text style={pickerStyles.label}>{label}</Text>
      <Pressable
        style={[pickerStyles.trigger, disabled && pickerStyles.triggerDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={pickerStyles.triggerInner}>
          <Ionicons name="person-outline" size={20} color="#1E40AF" />
          <Text
            style={[
              pickerStyles.triggerText,
              !value && pickerStyles.triggerPlaceholder,
            ]}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#64748B" />
      </Pressable>
    </View>
  );
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
  const [parentsLoadedForStudentId, setParentsLoadedForStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [classPickerOpen, setClassPickerOpen] = useState(false);
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);
  const [parentPickerOpen, setParentPickerOpen] = useState(false);

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
    setParentsLoadedForStudentId("");
  }, [selectedClassId]);

  const selectedClassLabel =
    classOptions.find((c) => c.value === selectedClassId)?.label ?? "";

  const selectedStudentLabel =
    students.find((s) => s.value === selectedStudentId)?.label ?? "";

  const selectedParentLabel =
    parentOptions.find((p) => p.value === selectedParentId)?.label ?? "";

  const fetchParents = useCallback(async (studentId: string) => {
    setLoadingParents(true);
    try {
      const options = await loadParentOptions(studentId);
      setParentOptions(options);
      setParentsLoadedForStudentId(studentId);
      if (options.length === 1) {
        setSelectedParentId(options[0].value);
      }
      return options;
    } catch {
      setParentOptions([]);
      setParentsLoadedForStudentId(studentId);
      return [];
    } finally {
      setLoadingParents(false);
    }
  }, []);

  const openStudentPicker = useCallback(() => {
    if (!selectedClassId) {
      showErrorAlert(t("common.error"), t("directMessage.selectClassFirst"));
      return;
    }
    if (loadingStudents) return;
    if (students.length === 0) {
      showErrorAlert(t("common.error"), t("directMessage.noStudents"));
      return;
    }
    setStudentPickerOpen(true);
  }, [loadingStudents, selectedClassId, students.length, t]);

  const openParentPicker = useCallback(async () => {
    if (!selectedStudentId) {
      showErrorAlert(t("common.error"), t("directMessage.selectStudent"));
      openStudentPicker();
      return;
    }

    setParentPickerOpen(true);

    if (parentsLoadedForStudentId !== selectedStudentId) {
      setSelectedParentId("");
      await fetchParents(selectedStudentId);
    }
  }, [
    fetchParents,
    openStudentPicker,
    parentsLoadedForStudentId,
    selectedStudentId,
    t,
  ]);

  const handleRecipientRoleSelect = (value: string) => {
    const role = value as DirectMessageRecipientRole;
    setRecipientRole(role);
    setSelectedParentId("");

    if (!selectedClassId) {
      showErrorAlert(t("common.error"), t("directMessage.selectClassFirst"));
      return;
    }

    if (role === "student") {
      openStudentPicker();
      return;
    }

    if (!selectedStudentId) {
      openStudentPicker();
      return;
    }

    void openParentPicker();
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    setStudentPickerOpen(false);
    setSelectedParentId("");
    setParentOptions([]);
    setParentsLoadedForStudentId("");

    if (recipientRole === "parent") {
      void fetchParents(studentId).then((options) => {
        if (options.length > 0) {
          setParentPickerOpen(true);
        }
      });
    }
  };

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
        <PickerField
          label={t("directMessage.classLabel")}
          placeholder={t("directMessage.chooseClass")}
          value={selectedClassLabel}
          disabled={classOptions.length === 0}
          onPress={() => {
            if (classOptions.length === 0) {
              showErrorAlert(t("common.error"), t("directMessage.noClasses"));
              return;
            }
            setClassPickerOpen(true);
          }}
        />
      ) : null}

      <Text style={styles.recipientTypeLabel}>
        {t("directMessage.recipientType")}
      </Text>
      <SelectChips
        options={recipientRoleOptions}
        selectedValue={recipientRole}
        onSelect={handleRecipientRoleSelect}
      />

      <PickerField
        label={t("directMessage.studentLabel")}
        placeholder={t("directMessage.chooseStudent")}
        value={selectedStudentLabel}
        disabled={!selectedClassId || loadingStudents}
        onPress={openStudentPicker}
      />
      {loadingStudents ? (
        <ActivityIndicator color="#1E3A8A" style={styles.inlineLoader} />
      ) : null}

      {recipientRole === "parent" ? (
        <PickerField
          label={t("directMessage.parentLabel")}
          placeholder={t("directMessage.chooseParent")}
          value={selectedParentLabel}
          disabled={!selectedStudentId}
          onPress={() => void openParentPicker()}
        />
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

      <OptionPickerModal
        visible={classPickerOpen}
        title={t("directMessage.pickerClassTitle")}
        options={classOptions}
        selectedValue={selectedClassId}
        onSelect={(id) => {
          onClassChange(id);
          setClassPickerOpen(false);
        }}
        onClose={() => setClassPickerOpen(false)}
        emptyMessage={t("directMessage.noClasses")}
      />

      <OptionPickerModal
        visible={studentPickerOpen}
        title={t("directMessage.pickerStudentTitle")}
        options={students}
        selectedValue={selectedStudentId}
        onSelect={handleStudentSelect}
        onClose={() => setStudentPickerOpen(false)}
        loading={loadingStudents}
        emptyMessage={t("directMessage.noStudents")}
      />

      <OptionPickerModal
        visible={parentPickerOpen}
        title={t("directMessage.pickerParentTitle")}
        options={parentOptions}
        selectedValue={selectedParentId}
        onSelect={(id) => {
          setSelectedParentId(id);
          setParentPickerOpen(false);
        }}
        onClose={() => setParentPickerOpen(false)}
        loading={loadingParents}
        emptyMessage={t("directMessage.noParentLinked")}
      />
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 4,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  triggerDisabled: {
    opacity: 0.55,
  },
  triggerInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  triggerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    flex: 1,
  },
  triggerPlaceholder: {
    color: "#64748B",
    fontWeight: "500",
  },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 0,
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
  recipientTypeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 4,
  },
  inlineLoader: {
    marginTop: -4,
    marginBottom: 8,
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
