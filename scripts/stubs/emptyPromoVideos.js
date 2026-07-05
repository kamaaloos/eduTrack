/** Stub when the other brand's promo module is tree-shaken out at build time. */
export function getNativePromoVideoSource() {
  return 0;
}

export function getWebPromoVideoSources() {
  return { primary: "", fallback: "" };
}
