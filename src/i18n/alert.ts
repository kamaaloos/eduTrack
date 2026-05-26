import { Alert, type AlertButton } from "react-native";
import i18n from "./index";

/** Alert.alert with translated title/message/buttons. */
export function alertT(
  titleKey: string,
  messageKey?: string,
  buttons?: AlertButton[],
  options?: { titleParams?: object; messageParams?: object },
) {
  const title = i18n.t(titleKey, options?.titleParams);
  const message = messageKey
    ? i18n.t(messageKey, options?.messageParams)
    : undefined;
  const translatedButtons = buttons?.map((b) => ({
    ...b,
    text: b.text ? i18n.t(b.text) : undefined,
  }));
  Alert.alert(title, message, translatedButtons);
}
