import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { useAdminAcademic } from "../../hooks/useAdminAcademic";
import { AdminScreenHeader } from "./AdminScreenHeader";
import {
  AdminAcademicButton,
  AdminAcademicCard,
} from "./academic/AdminAcademicCard";
import { adminAcademicStyles as styles } from "./academic/adminAcademicStyles";

export type AdminAcademicViewProps = ReturnType<typeof useAdminAcademic>;

export function AdminAcademicView(props: AdminAcademicViewProps) {
  const { t } = useTranslation();
  const {
    contentClassId,
    setContentClassId,
    message,
    setMessage,
    hwTitle,
    setHwTitle,
    hwDue,
    setHwDue,
    hwDetails,
    setHwDetails,
    examSubject,
    setExamSubject,
    examDate,
    setExamDate,
    examDetails,
    setExamDetails,
    remark,
    setRemark,
    addMessage,
    addHomework,
    addExam,
    addRemark,
  } = props;

  return (
    <View style={styles.screen}>
      <AdminScreenHeader
        title={t("admin.academicLegacyTitle")}
        subtitle={t("admin.academicLegacySubtitle")}
        showBack
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>
            📅 {t("admin.timetableNoticeTitle")}
          </Text>
          <Text style={styles.noticeText}>{t("admin.timetableNoticeText")}</Text>
          <TouchableOpacity
            style={styles.noticeBtn}
            onPress={() => router.push("/(admin)/classes")}
          >
            <Text style={styles.noticeBtnText}>{t("admin.openClassSchedule")}</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder={t("admin.classIdPlaceholder")}
          value={contentClassId}
          onChangeText={setContentClassId}
          style={styles.input}
        />

        <AdminAcademicCard title={`📢 ${t("admin.messagesCard")}`}>
          <TextInput
            placeholder={t("admin.messagePlaceholder")}
            value={message}
            onChangeText={setMessage}
            style={styles.input}
          />
          <AdminAcademicButton onPress={addMessage} label={t("admin.sendMessage")} />
        </AdminAcademicCard>

        <AdminAcademicCard title={`📚 ${t("admin.homeworkCard")}`}>
          <TextInput
            placeholder={t("admin.titlePlaceholder")}
            value={hwTitle}
            onChangeText={setHwTitle}
            style={styles.input}
          />
          <TextInput
            placeholder={t("admin.daysLeftPlaceholder")}
            value={hwDue}
            onChangeText={setHwDue}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder={t("admin.detailsPlaceholder")}
            value={hwDetails}
            onChangeText={setHwDetails}
            style={[styles.input, styles.textArea]}
            multiline
          />
          <AdminAcademicButton onPress={addHomework} label={t("admin.addHomework")} />
        </AdminAcademicCard>

        <AdminAcademicCard title={`📝 ${t("admin.examsCard")}`}>
          <TextInput
            placeholder={t("admin.subjectPlaceholder")}
            value={examSubject}
            onChangeText={setExamSubject}
            style={styles.input}
          />
          <TextInput
            placeholder={t("admin.titlePlaceholder")}
            value={examDate}
            onChangeText={setExamDate}
            style={styles.input}
          />
          <TextInput
            placeholder={t("admin.detailsPlaceholder")}
            value={examDetails}
            onChangeText={setExamDetails}
            style={[styles.input, styles.textArea]}
            multiline
          />
          <AdminAcademicButton onPress={addExam} label={t("admin.addExam")} />
        </AdminAcademicCard>

        <AdminAcademicCard title={`✍️ ${t("admin.remarksCard")}`}>
          <TextInput
            placeholder={t("admin.remarkPlaceholder")}
            value={remark}
            onChangeText={setRemark}
            style={styles.input}
          />
          <AdminAcademicButton onPress={addRemark} label={t("admin.addRemark")} />
        </AdminAcademicCard>
      </ScrollView>
    </View>
  );
}
