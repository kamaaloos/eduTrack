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
                color={item.destructive ? "#DC2626" : "#334155"}
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

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: "row",
    minHeight: 0,
    width: "100%",
  },
  sidebar: {
    width: 248,
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    paddingHorizontal: 8,
  },
  sidebarSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarItems: {
    gap: 4,
    paddingBottom: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  navItemDestructive: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    borderRadius: 0,
    paddingTop: 16,
  },
  navItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  navItemTextDestructive: {
    color: "#DC2626",
  },
  main: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
});
