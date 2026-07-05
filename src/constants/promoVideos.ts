import type { AppLanguage } from "../i18n/languages";

export type { WebPromoVideoSources } from "./promoVideos.types";

const brandModule =
  process.env.EXPO_PUBLIC_APP_BRAND?.trim().toLowerCase() === "dugsi"
    ? require("./promoVideos.dugsi")
    : require("./promoVideos.edutrack");

export const getNativePromoVideoSource: (
  language: AppLanguage,
) => number = brandModule.getNativePromoVideoSource;

export const getWebPromoVideoSources: (
  language: AppLanguage,
) => import("./promoVideos.types").WebPromoVideoSources =
  brandModule.getWebPromoVideoSources;
