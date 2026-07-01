import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { landingGsapIds } from "../../hooks/useWebLandingGsap";
import { landingPillWebStyles as pillStyles } from "./landingPillWebStyles";

export type LandingCapability = {
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
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

  return (
    <div id={landingGsapIds.capabilityPills} style={pillStyles.capabilityRow}>
      {capabilities.map((cap, index) => (
        <div
          key={cap.labelKey}
          className="landing-pill-float"
          data-pill-index={index}
          style={pillStyles.pillFloat}
        >
          <div
            className="landing-pill landing-capability-pill"
            style={{
              ...pillStyles.capabilityPill,
              ...pillStyles.pillInteractive,
            }}
          >
            <span className="landing-pill-icon" aria-hidden style={pillStyles.iconWrap}>
              <Ionicons name={cap.icon} size={16} color="#4F46E5" />
            </span>
            <span className="landing-pill-label" style={pillStyles.capabilityLabel}>
              {t(cap.labelKey)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
