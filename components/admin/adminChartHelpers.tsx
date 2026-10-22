import { useState, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import { adminChartHorizontalPadding } from "../../src/constants/platformLayout";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";

/** Keep charts inside the admin column — not full browser width on web. */
export function useAdminChartWidth() {
  const layout = usePlatformLayout();
  const { width } = layout;
  const horizontalPad = adminChartHorizontalPadding(layout);
  const maxWidth = layout.isDesktopWeb ? 640 : 520;
  return Math.min(Math.max(width - horizontalPad, 280), maxWidth);
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
    <View style={chartStyles.legendWrap}>
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

const CHART_TILT_MAX_DEG = 12;
const PIE_CHART_HEIGHT = 200;

/** Web-only: chart leans toward the cursor with a soft theme glow. */
export function ChartTiltSurface({
  children,
  width,
  height = 220,
}: {
  children: ReactNode;
  width: number;
  height?: number;
}) {
  const { theme } = useSchoolTheme();
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  return (
    <Pressable
      focusable={false}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => {
        setHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
      {...({
        onMouseMove: (event: {
          nativeEvent: { locationX?: number; locationY?: number };
        }) => {
          const x = event.nativeEvent.locationX ?? width / 2;
          const y = event.nativeEvent.locationY ?? height / 2;
          const nx = Math.max(-1, Math.min(1, (x / Math.max(width, 1)) * 2 - 1));
          const ny = Math.max(-1, Math.min(1, (y / Math.max(height, 1)) * 2 - 1));
          setTilt({ x: nx, y: ny });
        },
      } as object)}
      style={[
        chartStyles.tiltStage,
        {
          width,
          minHeight: height,
          ...( {
            cursor: "pointer",
            perspective: 900,
          } as object),
        },
      ]}
    >
      <View
        style={[
          chartStyles.tiltInner,
          {
            transform: [
              { perspective: 900 },
              { rotateY: `${hovered ? tilt.x * CHART_TILT_MAX_DEG : 0}deg` },
              { rotateX: `${hovered ? -tilt.y * CHART_TILT_MAX_DEG : 0}deg` },
              { scale: hovered ? 1.03 : 1 },
            ],
            ...( {
              transitionProperty: "transform, filter",
              transitionDuration: "110ms",
              transitionTimingFunction: "ease-out",
              filter: hovered
                ? `drop-shadow(0 14px 28px ${theme.primaryColor}40) saturate(1.1) brightness(1.03)`
                : "drop-shadow(0 4px 10px rgba(15,23,42,0.1))",
            } as object),
          },
        ]}
      >
        {children}
      </View>
    </Pressable>
  );
}

/**
 * react-native-chart-kit places the pie at x = width/4 + paddingLeft.
 * Use paddingLeft = width/4 so the chart is centered in the SVG/canvas.
 */
function pieChartPaddingLeft(width: number): string {
  return String(Math.round(width / 4));
}

/** Pie chart centered in the card; on web, tilts toward the cursor on hover. */
export function AdminPieChart({
  data,
  chartWidth,
}: {
  data: {
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }[];
  chartWidth: number;
}) {
  const width = chartWidth;
  const height = PIE_CHART_HEIGHT;

  const chart = (
    <PieChart
      data={data}
      width={width}
      height={height}
      chartConfig={adminChartConfig}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft={pieChartPaddingLeft(width)}
      center={[0, 0]}
      hasLegend={false}
      absolute
      style={chartStyles.pieChart}
    />
  );

  return (
    <View style={[chartStyles.pieWrap, { width }]}>
      <ChartTiltSurface width={width} height={height}>
        {chart}
      </ChartTiltSurface>
    </View>
  );
}

export const ROLE_CHART_COLORS = ["#16A34A", "#2563EB", "#7C3AED"] as const;
export const ACADEMIC_CHART_COLORS = ["#D97706", "#DC2626", "#0891B2"] as const;

/** Per-bar fill colors for react-native-chart-kit BarChart (use with withCustomBarColorFromData). */
export function barColorsFromHex(colors: string[]) {
  return colors.map((hex) => () => hex);
}

export type InteractiveBarItem = {
  label: string;
  value: number;
  color: string;
};

function InteractiveBar({
  item,
  heightPx,
  accentColor,
}: {
  item: InteractiveBarItem;
  heightPx: number;
  accentColor: string;
}) {
  const [hovered, setHovered] = useState(false);
  const barColor = hovered ? accentColor : item.color;

  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={chartStyles.barColumn}
      accessibilityRole="text"
      accessibilityLabel={`${item.label}: ${item.value}`}
    >
      <Text
        style={[
          chartStyles.barValue,
          hovered ? chartStyles.barValueHovered : null,
        ]}
      >
        {item.value}
      </Text>
      <View style={chartStyles.barTrack}>
        <View
          style={[
            chartStyles.barFill,
            {
              height: Math.max(heightPx, 4),
              backgroundColor: barColor,
              transform: [{ scaleX: hovered ? 1.12 : 1 }, { scaleY: hovered ? 1.04 : 1 }],
              ...(Platform.OS === "web"
                ? ({
                    cursor: "pointer",
                    transitionProperty: "transform, background-color, box-shadow, filter",
                    transitionDuration: "150ms",
                    transitionTimingFunction: "ease-out",
                    boxShadow: hovered
                      ? `0 10px 22px ${barColor}66`
                      : `0 2px 8px ${item.color}33`,
                    filter: hovered ? "brightness(1.08) saturate(1.15)" : "none",
                  } as object)
                : null),
            },
          ]}
        />
      </View>
      <Text
        style={[
          chartStyles.barLabel,
          hovered ? { color: accentColor, fontWeight: "800" } : null,
        ]}
        numberOfLines={2}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

/** Custom bar chart so each bar (Homework, Exam, …) animates on its own hover. */
export function AdminInteractiveBarChart({
  items,
  chartWidth,
  height = 220,
}: {
  items: InteractiveBarItem[];
  chartWidth: number;
  height?: number;
}) {
  const { theme } = useSchoolTheme();
  const maxValue = Math.max(...items.map((item) => item.value), 1);
  const plotHeight = Math.max(height - 56, 120);

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={[chartStyles.barChart, { width: chartWidth, minHeight: height }]}>
      <View style={[chartStyles.barRow, { height: plotHeight + 28 }]}>
        {items.map((item) => (
          <InteractiveBar
            key={item.label}
            item={item}
            heightPx={Math.round((item.value / maxValue) * plotHeight)}
            accentColor={theme.accentColor}
          />
        ))}
      </View>
    </View>
  );
}

export const chartStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#0F172A",
  },
  chartCenter: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    alignSelf: "center",
  },
  pieWrap: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  tiltStage: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    overflow: "visible",
  },
  tiltInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  pieChart: {
    alignSelf: "center",
  },
  barChart: {
    alignSelf: "center",
    justifyContent: "flex-end",
  },
  barRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    width: "100%",
    gap: 8,
    paddingHorizontal: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 56,
    maxWidth: 120,
  },
  barValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 6,
  },
  barValueHovered: {
    color: "#0F172A",
    fontWeight: "800",
  },
  barTrack: {
    width: "72%",
    maxWidth: 64,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barFill: {
    width: "100%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
    lineHeight: 16,
  },
  legendWrap: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
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
