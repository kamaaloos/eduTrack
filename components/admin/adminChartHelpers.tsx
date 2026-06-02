import { Platform, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import type { ReactNode } from "react";

/** Keep charts inside the admin column — not full browser width on web. */
export function useAdminChartWidth() {
  const { width } = useWindowDimensions();
  const horizontalPad = Platform.OS === "web" ? 96 : 48;
  return Math.min(Math.max(width - horizontalPad, 280), 520);
}

export const adminChartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#2563EB",
  },
};

export type ChartLegendItem = {
  name: string;
  color: string;
  value: number | string;
};

export function ChartLegend({ items }: { items: ChartLegendItem[] }) {
  return (
    <View style={chartStyles.legend}>
      {items.map((item) => (
        <View key={item.name} style={chartStyles.legendItem}>
          <View
            style={[chartStyles.legendSwatch, { backgroundColor: item.color }]}
          />
          <Text style={chartStyles.legendLabel} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={chartStyles.legendValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function ChartCard({
  title,
  children,
  caption,
}: {
  title?: string;
  children: ReactNode;
  caption?: string;
}) {
  return (
    <View style={chartStyles.card}>
      {title ? <Text style={chartStyles.chartTitle}>{title}</Text> : null}
      <View style={chartStyles.chartCenter}>{children}</View>
      {caption ? <Text style={chartStyles.caption}>{caption}</Text> : null}
    </View>
  );
}

export const ROLE_CHART_COLORS = ["#16A34A", "#2563EB", "#7C3AED"] as const;
export const ACADEMIC_CHART_COLORS = ["#D97706", "#DC2626", "#0891B2"] as const;

export const chartStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#0F172A",
  },
  chartCenter: {
    alignItems: "center",
    overflow: "hidden",
  },
  caption: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 10,
    lineHeight: 18,
  },
  legend: {
    marginTop: 12,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    flexShrink: 0,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  legendValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    minWidth: 28,
    textAlign: "right",
  },
});
