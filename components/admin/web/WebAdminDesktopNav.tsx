import { Ionicons } from "@expo/vector-icons";
import { useSegments } from "expo-router";
import { useContext, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { AdminSideMenuItem } from "../AdminSideMenu";
import { AuthContext } from "../../../src/context/authContext";
import { useSchoolContext } from "../../../src/context/schoolContext";
import { useSchoolTheme } from "../../../src/context/schoolThemeContext";

type WebAdminDesktopNavProps = {
  items: AdminSideMenuItem[];
  children: ReactNode;
};

type NavGroup = {
  id: string;
  labelKey: string;
  keys: string[];
};

const GROUPS: NavGroup[] = [
  {
    id: "general",
    labelKey: "admin.webNavGroupGeneral",
    keys: ["dashboard", "profile", "notifications"],
  },
  {
    id: "administrative",
    labelKey: "admin.webNavGroupAdministrative",
    keys: [
      "complaints",
      "users",
      "classes",
      "assignments",
      "system",
    ],
  },
  {
    id: "academic",
    labelKey: "admin.webNavGroupAcademic",
    keys: ["analytics", "performance", "certificates"],
  },
];

function resolveActiveKey(segments: string[]): string | null {
  const path = segments.join("/");
  if (path.includes("dashboard")) return "dashboard";
  if (path.includes("profile")) return "profile";
  if (path.includes("notifications")) return "notifications";
  if (path.includes("complaints")) return "complaints";
  if (path.includes("users") || path.includes("user-directory")) return "users";
  if (path.includes("classes") || path.includes("class-directory")) return "classes";
  if (path.includes("assignments")) return "assignments";
  if (path.includes("system")) return "system";
  if (path.includes("analytics")) return "analytics";
  if (path.includes("performance")) return "performance";
  if (path.includes("certificates")) return "certificates";
  return null;
}

function NavItemButton({
  item,
  active,
  primaryColor,
  accentColor,
  fontFamily,
}: {
  item: AdminSideMenuItem;
  active: boolean;
  primaryColor: string;
  accentColor: string;
  fontFamily?: string | null;
}) {
  const [hovered, setHovered] = useState(false);
  const bg = item.destructive
    ? hovered
      ? "rgba(254, 226, 226, 0.22)"
      : "rgba(254, 226, 226, 0.12)"
    : active
      ? accentColor
      : hovered
        ? accentColor
        : "rgba(255, 255, 255, 0.1)";

  return (
    <Pressable
      onPress={item.onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.navItem,
        {
          backgroundColor: bg,
          borderColor: active
            ? "rgba(255, 255, 255, 0.45)"
            : hovered
              ? accentColor
              : "rgba(255, 255, 255, 0.14)",
          ...(Platform.OS === "web"
            ? ({
                cursor: "pointer",
                transitionProperty: "background-color, border-color, transform",
                transitionDuration: "150ms",
                transform: [{ scale: hovered && !active ? 1.02 : 1 }],
              } as object)
            : null),
        },
        item.destructive ? styles.navItemDestructive : null,
      ]}
    >
      <Ionicons
        name={item.icon}
        size={20}
        color={item.destructive ? "#FCA5A5" : "#FFFFFF"}
      />
      <Text
        style={[
          styles.navItemText,
          item.destructive ? styles.navItemTextDestructive : null,
          fontFamily ? { fontFamily } : null,
        ]}
        numberOfLines={2}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

export function WebAdminDesktopNav({ items, children }: WebAdminDesktopNavProps) {
  const { t } = useTranslation();
  const segments = useSegments();
  const { selectedSchool } = useSchoolContext();
  const { userData } = useContext(AuthContext);
  const { theme, fontFamily } = useSchoolTheme();
  const activeKey = useMemo(() => resolveActiveKey([...segments]), [segments]);

  const itemByKey = useMemo(() => {
    const map = new Map<string, AdminSideMenuItem>();
    items.forEach((item) => map.set(item.key, item));
    return map;
  }, [items]);

  const logoutItem = itemByKey.get("logout");

  return (
    <View style={styles.shell}>
      <View
        style={[
          styles.sidebar,
          { backgroundColor: theme.primaryColor },
        ]}
      >
        <View style={styles.brandBlock}>
          {selectedSchool?.logoUrl ? (
            <Image
              source={{ uri: selectedSchool.logoUrl }}
              style={styles.brandLogo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.brandLogoPlaceholder}>
              <Ionicons name="school" size={28} color={theme.primaryColor} />
            </View>
          )}
          <Text
            style={[styles.brandName, fontFamily ? { fontFamily } : null]}
            numberOfLines={2}
          >
            {selectedSchool?.name ?? t("admin.management")}
          </Text>
        </View>

        <View style={styles.profileBlock}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={22} color={theme.primaryColor} />
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName} numberOfLines={1}>
              {userData?.name ?? t("common.admin")}
            </Text>
            <Text style={styles.profileRole}>{t("common.admin")}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.sidebarScroll}
          contentContainerStyle={styles.sidebarItems}
          showsVerticalScrollIndicator={false}
        >
          {GROUPS.map((group) => {
            const groupItems = group.keys
              .map((key) => itemByKey.get(key))
              .filter((item): item is AdminSideMenuItem => Boolean(item));
            if (groupItems.length === 0) return null;
            return (
              <View key={group.id} style={styles.group}>
                <Text style={styles.groupLabel}>{t(group.labelKey)}</Text>
                {groupItems.map((item) => (
                  <NavItemButton
                    key={item.key}
                    item={item}
                    active={activeKey === item.key}
                    primaryColor={theme.primaryColor}
                    accentColor={theme.accentColor}
                    fontFamily={fontFamily}
                  />
                ))}
              </View>
            );
          })}
          {logoutItem ? (
            <NavItemButton
              item={logoutItem}
              active={false}
              primaryColor={theme.primaryColor}
              accentColor={theme.accentColor}
              fontFamily={fontFamily}
            />
          ) : null}
        </ScrollView>
      </View>
      <View style={styles.main}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: "row",
    minHeight: 0,
    width: "100%",
  },
  sidebar: {
    width: 272,
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  brandBlock: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.15)",
    marginBottom: 12,
  },
  brandLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  brandLogoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  brandName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 20,
  },
  profileBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    paddingBottom: 12,
    marginBottom: 8,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileMeta: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileRole: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarItems: {
    gap: 14,
    paddingBottom: 12,
  },
  group: {
    marginBottom: 4,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.55)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  navItemDestructive: {
    marginTop: 4,
  },
  navItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 20,
  },
  navItemTextDestructive: {
    color: "#FCA5A5",
  },
  main: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
});
