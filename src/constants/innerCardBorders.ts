import type { ViewStyle } from "react-native";

/** Layout debug: section / wrapper outlines (not the outer WebPageCardFrame). */
export const INNER_CARD_BORDER_RED = "#EF4444";

/** Layout debug: leaf card outlines. */
export const INNER_CARD_BORDER_GREEN = "#22C55E";

export const innerSectionBorderStyle: ViewStyle = {
  borderWidth: 1,
  borderColor: INNER_CARD_BORDER_RED,
};

export const innerCardBorderStyle: ViewStyle = {
  borderWidth: 1,
  borderColor: INNER_CARD_BORDER_GREEN,
};

export const innerCardAccentBorderStyle: ViewStyle = {
  borderLeftWidth: 4,
  borderLeftColor: INNER_CARD_BORDER_RED,
};
