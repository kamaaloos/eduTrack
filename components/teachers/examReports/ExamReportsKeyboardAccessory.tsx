import { useTranslation } from "react-i18next";
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EXAM_REPORTS_KEYBOARD_ACCESSORY_ID } from "./examReportsTypes";
import { examReportsStyles as styles } from "./examReportsStyles";

export function ExamReportsKeyboardAccessory() {
  const { t } = useTranslation();

  if (Platform.OS !== "ios") {
    return null;
  }

  return (
    <InputAccessoryView nativeID={EXAM_REPORTS_KEYBOARD_ACCESSORY_ID}>
      <View style={styles.keyboardAccessory}>
        <TouchableOpacity
          style={styles.keyboardDoneBtn}
          onPress={() => Keyboard.dismiss()}
          accessibilityRole="button"
          accessibilityLabel={t("common.done")}
        >
          <Text style={styles.keyboardDoneText}>{t("common.done")}</Text>
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
  );
}
