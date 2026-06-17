/** FAQ item keys — questions/answers live in i18n under `faq.items.<key>`. */
export const FAQ_ITEM_KEYS = [
  "whatIsEduTrack",
  "whoCanUse",
  "howToSignIn",
  "webAndMobile",
  "students",
  "teachers",
  "parents",
  "administrators",
  "excelImport",
  "dataSecurity",
  "languages",
  "getSupport",
] as const;

export type FaqItemKey = (typeof FAQ_ITEM_KEYS)[number];
