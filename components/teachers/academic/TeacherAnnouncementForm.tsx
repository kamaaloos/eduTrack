import { useTranslation } from "react-i18next";
import { Text, TextInput, View } from "react-native";
import { SchoolThemeButton } from "../../common/SchoolThemeButton";
import { teacherAcademicStyles as styles } from "./teacherAcademicStyles";

type TeacherAnnouncementFormProps = {
  announcementTitle: string;
  onAnnouncementTitleChange: (value: string) => void;
  announcementText: string;
  onAnnouncementTextChange: (value: string) => void;
  onPublish: () => void;
};

export function TeacherAnnouncementForm({
  announcementTitle,
  onAnnouncementTitleChange,
  announcementText,
  onAnnouncementTextChange,
  onPublish,
}: TeacherAnnouncementFormProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        📢 {t("teacher.academic.publishAnnouncement")}
      </Text>

      <TextInput
        placeholder={t("teacher.messages.titlePlaceholder")}
        style={styles.input}
        value={announcementTitle}
        onChangeText={onAnnouncementTitleChange}
      />

      <TextInput
        placeholder={t("teacher.academic.announcementTextPlaceholder")}
        multiline
        style={[styles.input, { height: 140 }]}
        value={announcementText}
        onChangeText={onAnnouncementTextChange}
      />

      <SchoolThemeButton
        label={t("teacher.academic.publishAnnouncementBtn")}
        onPress={onPublish}
      />
    </View>
  );
}
