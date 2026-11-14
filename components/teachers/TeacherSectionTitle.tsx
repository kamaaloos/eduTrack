import type { ReactNode } from "react";
import { Text } from "react-native";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

type TeacherSectionTitleProps = {
  children: ReactNode;
};

/** Dashboard section heading sized by school theme. */
export function TeacherSectionTitle({ children }: TeacherSectionTitleProps) {
  const { fontFamily, headingFontSize } = useSchoolTheme();

  return (
    <Text
      style={[
        styles.sectionTitle,
        { fontSize: headingFontSize },
        fontFamily ? { fontFamily } : null,
      ]}
    >
      {children}
    </Text>
  );
}
