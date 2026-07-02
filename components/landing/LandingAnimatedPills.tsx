import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { landingGsapIds } from "../../hooks/useWebLandingGsap";
import { webLandingStyles as styles } from "./webLandingStyles";

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
    <View nativeID={landingGsapIds.trustRoles} style={styles.trustRoles}>
      {roleKeys.map((roleKey) => (
        <View key={roleKey} style={styles.trustRole}>
          <Text style={styles.trustRoleText}>{t(roleKey)}</Text>
        </View>
      ))}
    </View>
  );
}

export function LandingCapabilityPills({
  capabilities,
}: LandingCapabilityPillsProps) {
  const { t } = useTranslation();

  return (
    <View nativeID={landingGsapIds.capabilityPills} style={styles.capabilityRow}>
      {capabilities.map((cap) => (
        <View key={cap.labelKey} style={styles.capabilityPill}>
          <Ionicons name={cap.icon} size={16} color="#4F46E5" />
          <Text style={styles.capabilityText}>{t(cap.labelKey)}</Text>
        </View>
      ))}
    </View>
  );
}
