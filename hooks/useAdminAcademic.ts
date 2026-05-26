import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { db } from "../src/services/firebase";

export function useAdminAcademic() {
  const { t } = useTranslation();
  const [contentClassId, setContentClassId] = useState("");
  const [message, setMessage] = useState("");
  const [hwTitle, setHwTitle] = useState("");
  const [hwDue, setHwDue] = useState("");
  const [hwDetails, setHwDetails] = useState("");
  const [examSubject, setExamSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examDetails, setExamDetails] = useState("");
  const [remark, setRemark] = useState("");

  const addMessage = async () => {
    if (!contentClassId || !message) {
      Alert.alert(t("admin.classAndMessageRequired"));
      return;
    }
    try {
      await addDoc(collection(db, "classes", contentClassId, "announcements"), {
        title: t("admin.broadcastAnnouncement"),
        text: message,
        message,
        icon: "📢",
        classId: contentClassId,
        createdAt: serverTimestamp(),
      });
      setMessage("");
      Alert.alert(t("admin.messageAdded"));
    } catch (e) {
      Alert.alert(
        t("common.error"),
        e instanceof Error ? e.message : t("admin.operationFailed"),
      );
    }
  };

  const addHomework = async () => {
    if (!contentClassId || !hwTitle || !hwDue) {
      Alert.alert(t("admin.classHomeworkRequired"));
      return;
    }
    try {
      await addDoc(collection(db, "classes", contentClassId, "homework"), {
        title: hwTitle,
        daysLeft: Number(hwDue) || 7,
        details: hwDetails.trim(),
        classId: contentClassId,
        createdAt: serverTimestamp(),
      });
      setHwTitle("");
      setHwDue("");
      setHwDetails("");
      Alert.alert(t("admin.homeworkAdded"));
    } catch (e) {
      Alert.alert(
        t("common.error"),
        e instanceof Error ? e.message : t("admin.operationFailed"),
      );
    }
  };

  const addExam = async () => {
    if (!contentClassId || !examSubject || !examDate) {
      Alert.alert(t("admin.classExamRequired"));
      return;
    }
    try {
      await addDoc(collection(db, "classes", contentClassId, "exams"), {
        subject: examSubject,
        title: examDate,
        details: examDetails.trim(),
        classId: contentClassId,
        createdAt: serverTimestamp(),
      });
      setExamSubject("");
      setExamDate("");
      setExamDetails("");
      Alert.alert(t("admin.examAdded"));
    } catch (e) {
      Alert.alert(
        t("common.error"),
        e instanceof Error ? e.message : t("admin.operationFailed"),
      );
    }
  };

  const addRemark = async () => {
    if (!contentClassId || !remark) {
      Alert.alert(t("admin.classRemarkRequired"));
      return;
    }
    try {
      await addDoc(collection(db, "classes", contentClassId, "remarks"), {
        text: remark,
        remark,
        teacher: t("common.admin"),
        type: "general",
        classId: contentClassId,
        createdAt: serverTimestamp(),
      });
      setRemark("");
      Alert.alert(t("admin.remarkAdded"));
    } catch (e) {
      Alert.alert(
        t("common.error"),
        e instanceof Error ? e.message : t("admin.operationFailed"),
      );
    }
  };

  return {
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
  };
}
