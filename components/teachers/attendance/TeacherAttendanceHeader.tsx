import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { teacherAttendanceStyles as styles } from "./teacherAttendanceStyles";

type TeacherAttendanceHeaderProps = {
  classes: any[];
  classId: string;
  onSelectClass: (id: string) => void;
};

export function TeacherAttendanceHeader({
  classes,
  classId,
  onSelectClass,
}: TeacherAttendanceHeaderProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.fixedHeader, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.title}>{t("teacher.attendance.title")}</Text>
      <Text style={styles.sub}>{t("teacher.attendance.selectClass")}</Text>

      <View style={styles.classRow}>
        {classes.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.classBtn, classId === c.id && styles.activeClass]}
            onPress={() => onSelectClass(c.id)}
          >
            <Text
              style={[
                styles.classText,
                classId === c.id && styles.activeClassText,
              ]}
            >
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {classes.length === 0 ? (
        <Text style={styles.warning}>{t("teacher.attendance.noClasses")}</Text>
      ) : null}
    </View>
  );
}
