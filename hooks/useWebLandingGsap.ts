import { useLayoutEffect } from "react";
import { Platform } from "react-native";
import gsap from "gsap";

const TRUST_ROLES_ID = "landing-trust-roles";
const CAPABILITY_PILLS_ID = "landing-capability-pills";
const FEATURES_SECTION_ID = "landing-features";

const TRUST_COLORS = {
  rest: { backgroundColor: "#FFFFFF", borderColor: "#E2E8F0" },
  hover: { backgroundColor: "#EEF2FF", borderColor: "#A5B4FC" },
  textRest: "#475569",
  textHover: "#4338CA",
  restShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  hoverShadow: "0 14px 34px rgba(79, 70, 229, 0.18)",
  ripple: "rgba(79, 70, 229, 0.24)",
};

const CAPABILITY_COLORS = {
  rest: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderColor: "rgba(255, 255, 255, 0.7)",
  },
  hover: {
    backgroundColor: "#FFFFFF",
    borderColor: "#6366F1",
  },
  textRest: "#334155",
  textHover: "#312E81",
  iconRest: "#4F46E5",
  iconHover: "#4338CA",
  restShadow: "0 2px 10px rgba(15, 23, 42, 0.06)",
  hoverShadow: "0 14px 32px rgba(79, 70, 229, 0.22)",
  ripple: "rgba(99, 102, 241, 0.28)",
};

type PillVariant = "trust" | "capability";

type PillBundle = {
  floatEl: HTMLElement;
  pill: HTMLElement;
  index: number;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasFinePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function findScrollParent(el: HTMLElement): Element | null {
  let parent = el.parentElement;
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll") {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

function isElementInView(el: Element, root: Element | null): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.height === 0) {
    return false;
  }

  if (!root) {
    return rect.top < window.innerHeight * 0.88 && rect.bottom > 0;
  }

  const rootRect = root.getBoundingClientRect();
  return rect.top < rootRect.bottom * 0.88 && rect.bottom > rootRect.top;
}

function getFloatBundles(containerId: string): PillBundle[] {
  const container = document.getElementById(containerId);
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(".landing-pill-float"),
  )
    .map((floatEl, index) => {
      const pill = floatEl.querySelector<HTMLElement>(".landing-pill");
      if (!pill) {
        return null;
      }
      const dataIndex = Number(floatEl.dataset.pillIndex);
      return {
        floatEl,
        pill,
        index: Number.isFinite(dataIndex) ? dataIndex : index,
      };
    })
    .filter((bundle): bundle is PillBundle => bundle !== null);
}

function getLabel(pill: HTMLElement): HTMLElement | null {
  return pill.querySelector<HTMLElement>(".landing-pill-label");
}

function getIconPaths(pill: HTMLElement): SVGElement[] {
  return Array.from(
    pill.querySelectorAll<SVGElement>(".landing-pill-icon path"),
  );
}

function setIconColor(paths: SVGElement[], color: string) {
  if (paths.length === 0) {
    return;
  }

  gsap.to(paths, {
    stroke: color,
    duration: 0.3,
    ease: "power2.out",
  });
}

function spawnRipple(pill: HTMLElement, event: MouseEvent, color: string) {
  const ripple = document.createElement("span");
  ripple.className = "landing-pill-ripple";
  ripple.setAttribute("aria-hidden", "true");

  const rect = pill.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2.2;
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  Object.assign(ripple.style, {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    backgroundColor: color,
    pointerEvents: "none",
    transform: "scale(0)",
    opacity: "0.45",
    zIndex: "0",
  });

  pill.appendChild(ripple);

  gsap.to(ripple, {
    scale: 1,
    opacity: 0,
    duration: 0.62,
    ease: "power2.out",
    onComplete: () => {
      ripple.remove();
    },
  });
}

function playScrollEntrance(bundles: PillBundle[]): gsap.core.Tween | undefined {
  if (bundles.length === 0) {
    return undefined;
  }

  const floatEls = bundles.map((bundle) => bundle.floatEl);
  const pills = bundles.map((bundle) => bundle.pill);

  gsap.set(floatEls, { autoAlpha: 0, y: 40 });
  gsap.set(pills, { scale: 0.92, x: 0, y: 0 });

  return gsap.to(floatEls, {
    autoAlpha: 1,
    y: 0,
    duration: 0.72,
    ease: "back.out(1.35)",
    stagger: 0.1,
    onComplete: () => {
      bundles.forEach((bundle) => {
        startFloatingMotion(bundle);
      });
    },
  });
}

function startFloatingMotion({ floatEl, index }: PillBundle) {
  gsap.to(floatEl, {
    y: -2.5,
    duration: 3 + (index % 4) * 0.35,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
    delay: index * 0.12,
  });
}

function attachPremiumInteractions(
  bundle: PillBundle,
  variant: PillVariant,
): () => void {
  const { pill } = bundle;
  const text = getLabel(pill);
  const iconPaths = variant === "capability" ? getIconPaths(pill) : [];
  const palette = variant === "trust" ? TRUST_COLORS : CAPABILITY_COLORS;

  let hovered = false;

  const magneticX = gsap.quickTo(pill, "x", {
    duration: 0.38,
    ease: "power3.out",
  });
  const magneticY = gsap.quickTo(pill, "y", {
    duration: 0.38,
    ease: "power3.out",
  });

  const applyHoverStyles = () => {
    gsap.to(pill, {
      scale: 1.07,
      boxShadow: palette.hoverShadow,
      ...(variant === "trust" ? TRUST_COLORS.hover : CAPABILITY_COLORS.hover),
      duration: 0.32,
      ease: "power2.out",
    });

    if (text) {
      gsap.to(text, {
        color: palette.textHover,
        duration: 0.32,
        ease: "power2.out",
      });
    }

    if (variant === "capability") {
      setIconColor(iconPaths, CAPABILITY_COLORS.iconHover);
    }
  };

  const resetHoverStyles = () => {
    gsap.to(pill, {
      x: 0,
      y: 0,
      scale: 1,
      boxShadow: palette.restShadow,
      ...(variant === "trust"
        ? TRUST_COLORS.rest
        : { ...CAPABILITY_COLORS.rest, boxShadow: palette.restShadow }),
      duration: 0.42,
      ease: "power2.out",
    });

    if (text) {
      gsap.to(text, {
        color: palette.textRest,
        duration: 0.32,
        ease: "power2.out",
      });
    }

    if (variant === "capability") {
      setIconColor(iconPaths, CAPABILITY_COLORS.iconRest);
    }
  };

  const onEnter = () => {
    hovered = true;
    applyHoverStyles();
  };

  const onLeave = () => {
    hovered = false;
    resetHoverStyles();
  };

  const onMove = (event: MouseEvent) => {
    if (!hovered) {
      return;
    }

    const rect = pill.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const strength = 0.2;

    magneticX((event.clientX - centerX) * strength);
    magneticY((event.clientY - centerY) * strength);
  };

  const onClick = (event: MouseEvent) => {
    spawnRipple(pill, event, palette.ripple);
    gsap.fromTo(
      pill,
      { scale: hovered ? 1.07 : 1 },
      {
        scale: hovered ? 1.04 : 0.97,
        duration: 0.11,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      },
    );
  };

  const onPointerDown = () => {
    if (!hovered) {
      gsap.to(pill, { scale: 0.98, duration: 0.12, ease: "power2.out" });
    }
  };

  const onPointerUp = () => {
    if (hovered) {
      gsap.to(pill, { scale: 1.07, duration: 0.16, ease: "power2.out" });
      return;
    }
    gsap.to(pill, { scale: 1, duration: 0.16, ease: "power2.out" });
  };

  if (hasFinePointer()) {
    pill.addEventListener("mouseenter", onEnter);
    pill.addEventListener("mouseleave", onLeave);
    pill.addEventListener("mousemove", onMove);
  }

  pill.addEventListener("click", onClick);
  pill.addEventListener("pointerdown", onPointerDown);
  pill.addEventListener("pointerup", onPointerUp);
  pill.addEventListener("pointercancel", onPointerUp);

  return () => {
    pill.removeEventListener("mouseenter", onEnter);
    pill.removeEventListener("mouseleave", onLeave);
    pill.removeEventListener("mousemove", onMove);
    pill.removeEventListener("click", onClick);
    pill.removeEventListener("pointerdown", onPointerDown);
    pill.removeEventListener("pointerup", onPointerUp);
    pill.removeEventListener("pointercancel", onPointerUp);
  };
}

function revealBundlesOnScroll(
  bundles: PillBundle[],
  triggerId: string,
): () => void {
  if (bundles.length === 0) {
    return () => {};
  }

  const trigger = document.getElementById(triggerId);
  if (!trigger) {
    playScrollEntrance(bundles);
    return () => {};
  }

  let played = false;
  const play = () => {
    if (played) {
      return;
    }
    played = true;
    playScrollEntrance(bundles);
    observer.disconnect();
  };

  const scrollRoot = findScrollParent(trigger);
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        play();
      }
    },
    {
      root: scrollRoot,
      threshold: 0.15,
      rootMargin: "0px 0px -6% 0px",
    },
  );

  observer.observe(trigger);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (isElementInView(trigger, scrollRoot)) {
        play();
      }
    });
  });

  return () => {
    observer.disconnect();
  };
}

function waitForBundlesReady(onReady: () => void): () => void {
  let cancelled = false;
  let attempts = 0;

  const tryReady = () => {
    if (cancelled) {
      return;
    }

    const trustBundles = getFloatBundles(TRUST_ROLES_ID);
    const capabilityBundles = getFloatBundles(CAPABILITY_PILLS_ID);

    if (trustBundles.length > 0 && capabilityBundles.length > 0) {
      gsap.set(
        [...trustBundles, ...capabilityBundles].map((bundle) => bundle.floatEl),
        { autoAlpha: 0 },
      );
      onReady();
      return;
    }

    attempts += 1;
    if (attempts < 60) {
      requestAnimationFrame(tryReady);
    }
  };

  requestAnimationFrame(tryReady);

  return () => {
    cancelled = true;
  };
}

/**
 * Web-only GSAP animations for landing page pill buttons (trust roles + capabilities).
 * Re-runs when `language` changes so translated content re-animates cleanly.
 */
export function useWebLandingGsap(language: string) {
  useLayoutEffect(() => {
    if (Platform.OS !== "web" || prefersReducedMotion()) {
      return undefined;
    }

    let cancelled = false;
    let cleanupReady = () => {};
    const interactionCleanups: (() => void)[] = [];
    const revealCleanups: (() => void)[] = [];
    let ctx: gsap.Context | undefined;

    cleanupReady = waitForBundlesReady(() => {
      if (cancelled) {
        return;
      }

      const trustBundles = getFloatBundles(TRUST_ROLES_ID);
      const capabilityBundles = getFloatBundles(CAPABILITY_PILLS_ID);

      ctx = gsap.context(() => {});

      revealCleanups.push(
        revealBundlesOnScroll(trustBundles, TRUST_ROLES_ID),
        revealBundlesOnScroll(capabilityBundles, FEATURES_SECTION_ID),
      );

      trustBundles.forEach((bundle) => {
        interactionCleanups.push(
          attachPremiumInteractions(bundle, "trust"),
        );
      });
      capabilityBundles.forEach((bundle) => {
        interactionCleanups.push(
          attachPremiumInteractions(bundle, "capability"),
        );
      });
    });

    return () => {
      cancelled = true;
      cleanupReady();
      revealCleanups.forEach((cleanup) => cleanup());
      interactionCleanups.forEach((cleanup) => cleanup());
      ctx?.revert();
    };
  }, [language]);
}

export const landingGsapIds = {
  trustRoles: TRUST_ROLES_ID,
  capabilityPills: CAPABILITY_PILLS_ID,
} as const;
