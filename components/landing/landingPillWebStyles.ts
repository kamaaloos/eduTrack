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

  capabilitySection: {
    width: "100%",
    maxWidth: 820,
    margin: "0 auto 32px",
  } satisfies CSSProperties,

  capabilityPillActive: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #6366F1",
    boxShadow: "0 14px 32px rgba(79, 70, 229, 0.22)",
  } satisfies CSSProperties,

  capabilityDescPanel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    minHeight: 56,
    marginTop: 14,
    padding: "12px 18px",
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    border: "1px solid rgba(99, 102, 241, 0.18)",
    boxShadow: "0 8px 24px rgba(79, 70, 229, 0.08)",
    textAlign: "center",
    opacity: 0,
  } satisfies CSSProperties,

  capabilityDescTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: "#312E81",
    lineHeight: 1.3,
  } satisfies CSSProperties,

  capabilityDescBody: {
    fontSize: 13,
    fontWeight: 500,
    color: "#475569",
    lineHeight: 1.5,
    maxWidth: 520,
  } satisfies CSSProperties,

  capabilityDescHint: {
    fontSize: 12,
    fontWeight: 500,
    color: "#94A3B8",
    lineHeight: 1.4,
  } satisfies CSSProperties,
} as const;
