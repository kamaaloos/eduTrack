import type { ReactNode } from "react";
import { View } from "react-native";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import {
  webDashboardColumnStyle,
  webDashboardColumnsStyle,
} from "../../src/constants/platformLayout";

type WebDashboardColumnsProps = {
  primary: ReactNode;
  secondary: ReactNode;
};

/** Side-by-side dashboard sections on desktop web; stacked elsewhere. */
export function WebDashboardColumns({
  primary,
  secondary,
}: WebDashboardColumnsProps) {
  const layout = usePlatformLayout();

  if (!layout.isDesktopWeb) {
    return (
      <>
        {primary}
        {secondary}
      </>
    );
  }

  return (
    <View style={webDashboardColumnsStyle(layout)}>
      <View style={webDashboardColumnStyle(layout)}>{primary}</View>
      <View style={webDashboardColumnStyle(layout)}>{secondary}</View>
    </View>
  );
}
