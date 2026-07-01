import type { CSSProperties } from "react";

export const landingPillWebStyles = {
  trustRolesRow: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    width: "100%",
    maxWidth: 900,
    margin: "0 auto",
  } satisfies CSSProperties,

  capabilityRow: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    width: "100%",
    maxWidth: 820,
    margin: "0 auto 32px",
  } satisfies CSSProperties,

  pillFloat: {
    display: "flex",
    flex: "0 0 auto",
    alignItems: "center",
    justifyContent: "center",
  } satisfies CSSProperties,

  pillInteractive: {
    position: "relative",
    overflow: "hidden",
    cursor: "default",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    willChange: "transform",
  } satisfies CSSProperties,

  trustPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 16px",
    borderRadius: 9999,
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,

  capabilityPill: {
    display: "inline-flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "9px 14px",
    borderRadius: 9999,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    border: "1px solid rgba(255, 255, 255, 0.7)",
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,

  trustLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#475569",
    lineHeight: 1.2,
    position: "relative",
    zIndex: 1,
  } satisfies CSSProperties,

  capabilityLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#334155",
    lineHeight: 1.2,
    position: "relative",
    zIndex: 1,
  } satisfies CSSProperties,

  iconWrap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    lineHeight: 0,
    position: "relative",
    zIndex: 1,
  } satisfies CSSProperties,
} as const;
