/** Delete-account FAQ keys — copy lives in i18n under `deleteAccount.items.<key>`. */
export const DELETE_ACCOUNT_ITEM_KEYS = [
  "howItWorks",
  "whichEmail",
  "whatIsDeleted",
  "schoolAdminFirst",
  "howLong",
] as const;

export type DeleteAccountItemKey = (typeof DELETE_ACCOUNT_ITEM_KEYS)[number];
