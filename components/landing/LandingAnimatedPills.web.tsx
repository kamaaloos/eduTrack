import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { landingGsapIds } from "../../hooks/useWebLandingGsap";
import { landingPillWebStyles as pillStyles } from "./landingPillWebStyles";

export type LandingCapability = {
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
  descKey: string;
};

type LandingTrustRolePillsProps = {
  roleKeys: readonly string[];
};

type LandingCapabilityPillsProps = {
  capabilities: readonly LandingCapability[];
};

export function LandingTrustRolePills({ roleKeys }: LandingTrustRolePillsProps) {
  const { t } = useTranslation();

  return (
    <div id={landingGsapIds.trustRoles} style={pillStyles.trustRolesRow}>
      {roleKeys.map((roleKey, index) => (
        <div
          key={roleKey}
          className="landing-pill-float"
          data-pill-index={index}
          style={pillStyles.pillFloat}
        >
          <div
            className="landing-pill landing-trust-pill"
            style={{
              ...pillStyles.trustPill,
              ...pillStyles.pillInteractive,
            }}
          >
            <span className="landing-pill-label" style={pillStyles.trustLabel}>
              {t(roleKey)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LandingCapabilityPills({
  capabilities,
}: LandingCapabilityPillsProps) {
  const { t } = useTranslation();
  const [activeDescKey, setActiveDescKey] = useState<string | null>(null);
  const descPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = descPanelRef.current;
    if (!panel) {
      return;
    }

    if (!activeDescKey) {
      gsap.to(panel, {
        autoAlpha: 0,
        y: -6,
        duration: 0.2,
        ease: "power2.in",
      });
      return;
    }

    gsap.fromTo(
      panel,
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, duration: 0.32, ease: "power2.out" },
    );
  }, [activeDescKey]);

  const activeCapability = capabilities.find(
    (cap) => cap.descKey === activeDescKey,
  );

  return (
    <div style={pillStyles.capabilitySection}>
      <div id={landingGsapIds.capabilityPills} style={pillStyles.capabilityRow}>
        {capabilities.map((cap, index) => {
          const isActive = activeDescKey === cap.descKey;

          return (
            <div
              key={cap.labelKey}
              className="landing-pill-float"
              data-pill-index={index}
              style={pillStyles.pillFloat}
            >
              <button
                type="button"
                className="landing-pill landing-capability-pill"
                aria-pressed={isActive}
                aria-expanded={isActive}
                aria-controls="landing-capability-desc"
                onClick={() => {
                  setActiveDescKey((current) =>
                    current === cap.descKey ? null : cap.descKey,
                  );
                }}
                style={{
                  ...pillStyles.capabilityPill,
                  ...pillStyles.pillInteractive,
                  ...(isActive ? pillStyles.capabilityPillActive : null),
                  cursor: "pointer",
                  border: "none",
                  font: "inherit",
                }}
              >
                <span
                  className="landing-pill-icon"
                  aria-hidden
                  style={pillStyles.iconWrap}
                >
                  <Ionicons name={cap.icon} size={16} color="#4F46E5" />
                </span>
                <span
                  className="landing-pill-label"
                  style={pillStyles.capabilityLabel}
                >
                  {t(cap.labelKey)}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div
        id="landing-capability-desc"
        ref={descPanelRef}
        role="region"
        aria-live="polite"
        style={{
          ...pillStyles.capabilityDescPanel,
          visibility: activeDescKey ? "visible" : "hidden",
        }}
      >
        {activeCapability ? (
          <>
            <span style={pillStyles.capabilityDescTitle}>
              {t(activeCapability.labelKey)}
            </span>
            <span style={pillStyles.capabilityDescBody}>
              {t(activeCapability.descKey)}
            </span>
          </>
        ) : (
          <span style={pillStyles.capabilityDescHint}>
            {t("landing.capabilityClickHint")}
          </span>
        )}
      </div>
    </div>
  );
}
