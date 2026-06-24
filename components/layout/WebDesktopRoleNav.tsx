import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import type { AdminSideMenuItem } from "../admin/AdminSideMenu";

type WebDesktopRoleNavProps = {
  title: string;
  subtitle?: string | null;
  items: AdminSideMenuItem[];
  children: ReactNode;
};

/** Persistent left navigation on desktop web for teacher/parent roles. */
export function WebDesktopRoleNav({
  title,
  subtitle,
  items,
  children,
}: WebDesktopRoleNavProps) {
  const layout = usePlatformLayout();

  if (!layout.isDesktopWeb) {
    return <>{children}</>;
  }

  return (
    <View style={styles.shell}>
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.sidebarSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        <ScrollView
          style={styles.sidebarScroll}
          contentContainerStyle={styles.sidebarItems}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.navItem,
                item.destructive ? styles.navItemDestructive : null,
              ]}
              onPress={item.onPress}
              activeOpacity={0.85}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={item.destructive ? "#FCA5A5" : "#E0E7FF"}
              />
              <Text
                style={[
                  styles.navItemText,
                  item.destructive ? styles.navItemTextDestructive : null,
                ]}
                numberOfLines={2}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.main}>{children}</View>
    </View>
  );
}

const NAVY = "#1E3A8A";

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: "row",
    minHeight: 0,
    width: "100%",
  },
  sidebar: {
    width: 258,
    borderRightWidth: 1,
    borderRightColor: "#172554",
    backgroundColor: NAVY,
    paddingTop: 20,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  sidebarTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    paddingHorizontal: 10,
  },
  sidebarSubtitle: {
    fontSize: 13,
    color: "#BFDBFE",
    marginTop: 6,
    marginBottom: 14,
    paddingHorizontal: 10,
    lineHeight: 19,
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarItems: {
    gap: 6,
    paddingBottom: 12,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  navItemDestructive: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 12,
    paddingTop: 18,
    backgroundColor: "rgba(254, 226, 226, 0.12)",
    borderColor: "rgba(252, 165, 165, 0.35)",
  },
  navItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#F8FAFC",
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
