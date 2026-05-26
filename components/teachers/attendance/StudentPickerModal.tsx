import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getAttendanceColor } from "../../../src/utils/dashboardUi";
import { attendanceStatusLabel } from "./attendanceStatusLabel";
import { teacherAttendanceStyles as styles } from "./teacherAttendanceStyles";
import type { StudentRow, TodayMap } from "./teacherAttendanceTypes";

type StudentPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  studentSearch: string;
  onStudentSearchChange: (text: string) => void;
  filteredStudents: StudentRow[];
  selectedStudentId: string;
  todayByStudent: TodayMap;
  onSelectStudent: (id: string) => void;
};

export function StudentPickerModal({
  visible,
  onClose,
  studentSearch,
  onStudentSearchChange,
  filteredStudents,
  selectedStudentId,
  todayByStudent,
  onSelectStudent,
}: StudentPickerModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t("teacher.attendance.selectStudent")}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder={t("teacher.attendance.searchStudent")}
            value={studentSearch}
            onChangeText={onStudentSearchChange}
            autoCorrect={false}
          />

          <FlatList
            data={filteredStudents}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            style={styles.modalList}
            renderItem={({ item }) => {
              const active = item.id === selectedStudentId;
              const record = todayByStudent[item.id];
              const label = getAttendanceColor(
                record?.status ?? "",
                record?.parentResponse,
              );
              return (
                <Pressable
                  style={[styles.modalItem, active && styles.modalItemActive]}
                  onPress={() => onSelectStudent(item.id)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      active && styles.modalItemTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {item.name || item.email || t("common.student")}
                  </Text>
                  {record ? (
                    <Text style={[styles.modalItemBadge, { color: label.text }]}>
                      {attendanceStatusLabel(label.label, t)}
                    </Text>
                  ) : (
                    <Text style={styles.modalItemBadgeMuted}>—</Text>
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.modalEmpty}>
                {t("teacher.attendance.noMatch")}
              </Text>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
