import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity } from "react-native";
import { examReportsStyles as styles } from "./examReportsStyles";

type ExamReportsShowMoreProps = {
  shown: number;
  total: number;
  onPress: () => void;
};

export function ExamReportsShowMore({
  shown,
  total,
  onPress,
}: ExamReportsShowMoreProps) {
  const { t } = useTranslation();

  if (shown >= total) return null;

  return (
    <TouchableOpacity style={styles.showMoreBtn} onPress={onPress}>
      <Text style={styles.showMoreText}>
        {t("teacher.examReports.showMore", { remaining: total - shown })}
      </Text>
      <Ionicons name="chevron-down" size={18} color="#2563EB" />
    </TouchableOpacity>
  );
}
