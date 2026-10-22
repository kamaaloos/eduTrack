import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SchoolTermCard } from "../SchoolTermCard";
import { AdminWebShortcutTile } from "./AdminWebShortcutTile";
import { WelcomeFlowerRise } from "./WelcomeFlowerRise";
import { usePlatformLayout } from "../../../hooks/usePlatformLayout";
import { useSchoolContext } from "../../../src/context/schoolContext";
import { useSchoolTheme } from "../../../src/context/schoolThemeContext";
type ShortcutDef = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  subtitle?: string;
};

type PeriodNoticeProps = {
  remainingDays: number;
  title: string;
  expiredText: string;
  remainingText: string;
  hintText: string;
};

type AdminWebDashboardBodyProps = {
  adminUid: string | undefined;
  students: number;
  teachers: number;
  parents: number;
  classes: number;
  shortcuts: ShortcutDef[];
  periodNotice: PeriodNoticeProps | null;
  refreshing: boolean;
  onRefresh: () => void;
};

function PeriodNoticeCard({
  remainingDays,
  title,
  expiredText,
  remainingText,
  hintText,
  primaryColor,
}: PeriodNoticeProps & { primaryColor: string }) {
  const isExpired = remainingDays <= 0;
  const isWarn = !isExpired && remainingDays <= 7;

  return (
    <View
      style={[
        styles.usageCard,
        {
          borderColor: isExpired ? "#FECACA" : primaryColor + "55",
        },
        isExpired ? styles.usageCardExpired : isWarn ? styles.usageCardWarn : null,
      ]}
    >
      <Ionicons
        name={
          isExpired ? "alert-circle-outline" : isWarn ? "warning-outline" : "time-outline"
        }
        size={18}
        color={isExpired ? "#B91C1C" : primaryColor}
      />
      <View style={styles.usageCardText}>
        <Text style={styles.usageTitle}>{title}</Text>
        <Text style={styles.usageSub}>{isExpired ? expiredText : remainingText}</Text>
        <Text style={styles.usageHint}>{hintText}</Text>
      </View>
    </View>
  );
}

function HeroStatBox({
  label,
  value,
  baseIsPrimary,
  fontFamily,
  onPress,
}: {
  label: string;
  value: number;
  baseIsPrimary: boolean;
  fontFamily?: string | null;
  onPress: () => void;
}) {
  const { theme } = useSchoolTheme();
  const [hovered, setHovered] = useState(false);
  const bg = hovered
    ? baseIsPrimary
      ? theme.accentColor
      : theme.primaryColor
    : baseIsPrimary
      ? theme.primaryColor
      : theme.accentColor;

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.statBox,
        {
          backgroundColor: bg,
          transform: [{ scale: pressed ? 0.97 : hovered ? 1.05 : 1 }],
          ...(Platform.OS === "web"
            ? ({
                cursor: "pointer",
                transitionProperty: "transform, background-color, box-shadow",
                transitionDuration: "160ms",
                transitionTimingFunction: "ease-out",
                boxShadow: hovered
                  ? `0 12px 26px ${bg}66`
                  : `0 3px 10px rgba(15, 23, 42, 0.12)`,
              } as object)
            : null),
        },
      ]}
    >
      <Text style={[styles.statValue, fontFamily ? { fontFamily } : null]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, fontFamily ? { fontFamily } : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function AdminWebDashboardBody({
  adminUid,
  students,
  teachers,
  parents,
  classes,
  shortcuts,
  periodNotice,
  refreshing,
  onRefresh,
}: AdminWebDashboardBodyProps) {
  const { t } = useTranslation();
  const { selectedSchool } = useSchoolContext();
  const { theme, fontFamily } = useSchoolTheme();
  const layout = usePlatformLayout();
  const [welcomeHovered, setWelcomeHovered] = useState(false);

  const shortcutCellWidth = layout.isCompactWeb
    ? "100%"
    : layout.isTabletWeb
      ? "50%"
      : "25%";

  const statBoxes = [
    {
      key: "students",
      value: students,
      label: t("admin.students"),
      route: "/(admin)/user-directory/student",
    },
    {
      key: "teachers",
      value: teachers,
      label: t("admin.teachers"),
      route: "/(admin)/user-directory/teacher",
    },
    {
      key: "parents",
      value: parents,
      label: t("admin.parents"),
      route: "/(admin)/user-directory/parent",
    },
    {
      key: "classes",
      value: classes,
      label: t("admin.classes"),
      route: "/(admin)/classes",
    },
  ];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        layout.isCompactWeb ? styles.contentCompact : null,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {periodNotice ? (
        <PeriodNoticeCard {...periodNotice} primaryColor={theme.primaryColor} />
      ) : null}

      <View style={styles.heroRow}>
        <View style={styles.statsHero}>
          {selectedSchool?.logoUrl ? (
            <Image
              source={{ uri: selectedSchool.logoUrl }}
              style={styles.statsLogo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.statsLogoPlaceholder}>
              <Ionicons name="school" size={32} color={theme.primaryColor} />
            </View>
          )}
          <View style={styles.statsGrid}>
            {statBoxes.map((box, index) => (
              <HeroStatBox
                key={box.key}
                label={box.label}
                value={box.value}
                baseIsPrimary={index % 2 === 0}
                fontFamily={fontFamily}
                onPress={() => router.push(box.route as never)}
              />
            ))}
          </View>
        </View>

        <Pressable
          onHoverIn={() => setWelcomeHovered(true)}
          onHoverOut={() => setWelcomeHovered(false)}
          onPress={() => router.push("/(admin)/system")}
          style={[
            styles.welcomeCard,
            {
              backgroundColor: welcomeHovered
                ? theme.accentColor
                : theme.primaryColor,
              ...(Platform.OS === "web"
                ? ({
                    cursor: "pointer",
                    transitionProperty: "background-color, box-shadow, transform",
                    transitionDuration: "180ms",
                    transform: [{ scale: welcomeHovered ? 1.01 : 1 }],
                    boxShadow: welcomeHovered
                      ? `0 14px 32px ${theme.accentColor}55`
                      : `0 8px 22px ${theme.primaryColor}40`,
                  } as object)
                : null),
            },
          ]}
        >
          <WelcomeFlowerRise accentColor={theme.accentColor} />
          <View style={styles.welcomeContent}>
            <Text
              style={[styles.welcomeTitle, fontFamily ? { fontFamily } : null]}
            >
              {t("admin.webWelcomeTitle")}
            </Text>
            <Text
              style={[styles.welcomeSub, fontFamily ? { fontFamily } : null]}
            >
              {t("admin.webWelcomeSubtitle")}
            </Text>
            <View
              style={[
                styles.welcomeCta,
                {
                  backgroundColor: welcomeHovered
                    ? theme.primaryColor
                    : "rgba(255,255,255,0.2)",
                },
              ]}
            >
              <Text
                style={[
                  styles.welcomeCtaText,
                  fontFamily ? { fontFamily } : null,
                ]}
              >
                {t("admin.webOpenSystem")}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>

      {adminUid ? <SchoolTermCard adminUid={adminUid} /> : null}

      <View style={styles.grid}>
        {shortcuts.map((item, index) => (
          <View
            key={item.key}
            style={[styles.gridCell, { width: shortcutCellWidth }]}
          >
            <AdminWebShortcutTile
              label={item.label}
              icon={item.icon}
              subtitle={item.subtitle}
              rowIndex={Math.floor(index / (layout.isCompactWeb ? 1 : layout.isTabletWeb ? 2 : 4))}
              onPress={() => router.push(item.route as never)}
            />
          </View>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  contentCompact: {
    paddingHorizontal: 14,
  },
  usageCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  usageCardWarn: {
    backgroundColor: "#FFFBEB",
  },
  usageCardExpired: {
    backgroundColor: "#FEF2F2",
  },
  usageCardText: { flex: 1 },
  usageTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  usageSub: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  usageHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },
  heroRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  statsHero: {
    flex: 1.15,
    minWidth: 280,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statsLogo: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  statsLogoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statBox: {
    flexGrow: 1,
    flexBasis: "45%",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 100,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  welcomeCard: {
    flex: 1.85,
    minWidth: 320,
    borderRadius: 16,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  welcomeContent: {
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 420,
    width: "100%",
  },
  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    textAlign: "center",
  },
  welcomeSub: {
    marginTop: 10,
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  welcomeCta: {
    marginTop: 18,
    alignSelf: "center",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  welcomeCtaText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginBottom: 20,
  },
  gridCell: {
    width: "25%",
    paddingHorizontal: 6,
    paddingBottom: 12,
    ...(Platform.OS === "web"
      ? ({ boxSizing: "border-box" } as object)
      : null),
  },
});
