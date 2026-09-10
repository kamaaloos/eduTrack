import { createElement, useLayoutEffect, useRef } from "react";
import { Platform, StyleSheet } from "react-native";
import gsap from "gsap";

const STYLE_ID = "eduTrack-landing-cinematic-css";

const CINEMATIC_CSS = `
@keyframes eduTrackLandingGrain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-2%, -3%); }
  20% { transform: translate(3%, 1%); }
  30% { transform: translate(-1%, 4%); }
  40% { transform: translate(2%, -2%); }
  50% { transform: translate(-3%, 1%); }
  60% { transform: translate(1%, -4%); }
  70% { transform: translate(-2%, 2%); }
  80% { transform: translate(4%, 0); }
  90% { transform: translate(-1%, -1%); }
}

@keyframes eduTrackLandingRaySweep {
  0% { transform: translateX(-18%) rotate(18deg); opacity: 0.18; }
  45% { opacity: 0.42; }
  100% { transform: translateX(18%) rotate(18deg); opacity: 0.2; }
}

@keyframes eduTrackLandingPulse {
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50% { opacity: 0.75; transform: scale(1.08); }
}

.eduTrack-landing-cinematic {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(120% 80% at 12% -10%, rgba(99, 102, 241, 0.28) 0%, transparent 55%),
    radial-gradient(90% 70% at 92% 8%, rgba(14, 165, 233, 0.22) 0%, transparent 50%),
    radial-gradient(80% 60% at 70% 95%, rgba(251, 191, 36, 0.18) 0%, transparent 55%),
    linear-gradient(165deg, #07111F 0%, #0F172A 38%, #1E1B4B 72%, #0B1220 100%);
}

.eduTrack-landing-cinematic__mesh {
  position: absolute;
  inset: -18%;
  background:
    radial-gradient(ellipse 45% 40% at 30% 35%, rgba(129, 140, 248, 0.35), transparent 70%),
    radial-gradient(ellipse 40% 35% at 72% 28%, rgba(56, 189, 248, 0.28), transparent 68%),
    radial-gradient(ellipse 50% 42% at 58% 78%, rgba(251, 191, 36, 0.2), transparent 72%),
    radial-gradient(ellipse 35% 30% at 18% 78%, rgba(167, 139, 250, 0.22), transparent 70%);
  filter: blur(8px);
  will-change: transform, opacity;
}

.eduTrack-landing-cinematic__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  will-change: transform, opacity;
  mix-blend-mode: screen;
}

.eduTrack-landing-cinematic__orb--a {
  width: min(52vw, 520px);
  height: min(52vw, 520px);
  top: 8%;
  left: -8%;
  background: radial-gradient(circle, rgba(129, 140, 248, 0.7) 0%, rgba(99, 102, 241, 0.15) 45%, transparent 70%);
}

.eduTrack-landing-cinematic__orb--b {
  width: min(44vw, 440px);
  height: min(44vw, 440px);
  top: 18%;
  right: -6%;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.55) 0%, rgba(14, 165, 233, 0.12) 48%, transparent 72%);
}

.eduTrack-landing-cinematic__orb--c {
  width: min(48vw, 480px);
  height: min(48vw, 480px);
  bottom: 4%;
  left: 28%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.42) 0%, rgba(245, 158, 11, 0.1) 46%, transparent 70%);
}

.eduTrack-landing-cinematic__orb--d {
  width: min(36vw, 360px);
  height: min(36vw, 360px);
  bottom: 22%;
  right: 18%;
  background: radial-gradient(circle, rgba(192, 132, 252, 0.45) 0%, rgba(168, 85, 247, 0.1) 50%, transparent 72%);
  animation: eduTrackLandingPulse 9s ease-in-out infinite;
}

.eduTrack-landing-cinematic__ray {
  position: absolute;
  top: -20%;
  left: -10%;
  width: 140%;
  height: 70%;
  background: linear-gradient(
    105deg,
    transparent 32%,
    rgba(255, 255, 255, 0.06) 46%,
    rgba(191, 219, 254, 0.16) 50%,
    rgba(255, 255, 255, 0.05) 54%,
    transparent 68%
  );
  filter: blur(18px);
  transform-origin: center;
  animation: eduTrackLandingRaySweep 16s ease-in-out infinite alternate;
}

.eduTrack-landing-cinematic__ray--late {
  top: 20%;
  opacity: 0.55;
  animation-duration: 22s;
  animation-delay: -6s;
  background: linear-gradient(
    95deg,
    transparent 38%,
    rgba(253, 230, 138, 0.08) 48%,
    rgba(255, 255, 255, 0.1) 52%,
    transparent 64%
  );
}

.eduTrack-landing-cinematic__vignette {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 75% 65% at 50% 40%, transparent 35%, rgba(2, 6, 23, 0.55) 100%),
    linear-gradient(180deg, rgba(2, 6, 23, 0.2) 0%, transparent 18%, transparent 72%, rgba(2, 6, 23, 0.55) 100%);
}

.eduTrack-landing-cinematic__grain {
  position: absolute;
  inset: -40%;
  width: 180%;
  height: 180%;
  opacity: 0.14;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
  animation: eduTrackLandingGrain 0.7s steps(2) infinite;
  mix-blend-mode: overlay;
}

@media (prefers-reduced-motion: reduce) {
  .eduTrack-landing-cinematic__mesh,
  .eduTrack-landing-cinematic__orb,
  .eduTrack-landing-cinematic__ray,
  .eduTrack-landing-cinematic__grain {
    animation: none !important;
  }
}
`;

function ensureCinematicStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CINEMATIC_CSS;
  document.head.appendChild(style);
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Fixed full-viewport cinematic backdrop for the web landing page.
 * Soft light blooms, anamorphic rays, grain, and slow GSAP drift.
 */
export function WebLandingCinematicBackdrop() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (Platform.OS !== "web") return undefined;

    ensureCinematicStyles();
    if (prefersReducedMotion()) return undefined;

    const root = rootRef.current;
    if (!root) return undefined;

    const mesh = root.querySelector<HTMLElement>(".eduTrack-landing-cinematic__mesh");
    const orbs = Array.from(
      root.querySelectorAll<HTMLElement>(".eduTrack-landing-cinematic__orb"),
    );

    const ctx = gsap.context(() => {
      if (mesh) {
        gsap.to(mesh, {
          xPercent: 4,
          yPercent: -3,
          rotation: 4,
          duration: 22,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
        gsap.to(mesh, {
          opacity: 0.78,
          duration: 8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      orbs.forEach((orb, index) => {
        const distance = 28 + index * 10;
        gsap.to(orb, {
          x: index % 2 === 0 ? distance : -distance,
          y: index % 2 === 0 ? -distance * 0.65 : distance * 0.5,
          duration: 14 + index * 3.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: index * 0.6,
        });
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

  if (Platform.OS !== "web") {
    return null;
  }

  return createElement(
    "div",
    {
      ref: rootRef,
      className: "eduTrack-landing-cinematic",
      "aria-hidden": true,
    },
    createElement("div", { className: "eduTrack-landing-cinematic__mesh" }),
    createElement("div", {
      className: "eduTrack-landing-cinematic__orb eduTrack-landing-cinematic__orb--a",
    }),
    createElement("div", {
      className: "eduTrack-landing-cinematic__orb eduTrack-landing-cinematic__orb--b",
    }),
    createElement("div", {
      className: "eduTrack-landing-cinematic__orb eduTrack-landing-cinematic__orb--c",
    }),
    createElement("div", {
      className: "eduTrack-landing-cinematic__orb eduTrack-landing-cinematic__orb--d",
    }),
    createElement("div", { className: "eduTrack-landing-cinematic__ray" }),
    createElement("div", {
      className: "eduTrack-landing-cinematic__ray eduTrack-landing-cinematic__ray--late",
    }),
    createElement("div", { className: "eduTrack-landing-cinematic__vignette" }),
    createElement("div", { className: "eduTrack-landing-cinematic__grain" }),
  );
}

/** RN style helpers for layering content above the fixed cinematic backdrop. */
export const cinematicBackdropLayerStyles = StyleSheet.create({
  contentAbove: {
    position: "relative",
    zIndex: 1,
    backgroundColor: "transparent",
  },
});
