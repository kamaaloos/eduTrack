import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { useSchoolTheme } from "../../../src/context/schoolThemeContext";
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
  const { theme } = useSchoolTheme();

  return (
    <View style={styles.fixedHeader}>
      <View style={styles.classRow}>
        {classes.map((c) => {
          const active = classId === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.classBtn,
                active
                  ? { backgroundColor: theme.primaryColor }
                  : null,
              ]}
              onPress={() => onSelectClass(c.id)}
            >
              <Text
                style={[
                  styles.classText,
                  active ? styles.activeClassText : null,
                ]}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {classes.length === 0 ? (
        <Text style={styles.warning}>{t("teacher.attendance.noClasses")}</Text>
      ) : null}
    </View>
  );
}
