import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { APP_MENU_BACKDROP } from "../../src/constants/appTheme";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import { platformShadowDrawer } from "../../src/utils/platformShadow";

const isWeb = Platform.OS === "web";
const DRAWER_WIDTH = 300;

export type AdminSideMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
};

type AdminSideMenuProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string | null;
  subtitleTone?: "muted" | "accent";
  items: AdminSideMenuItem[];
};

export function AdminSideMenu({
  visible,
  onClose,
  title,
  subtitle,
  subtitleTone = "muted",
  items,
}: AdminSideMenuProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const runItem = (onPress: () => void) => {
    onClose();
    if (isWeb) {
      requestAnimationFrame(() => onPress());
    } else {
      onPress();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isWeb ? "fade" : "slide"}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
        />
        <View
          style={[
            styles.panel,
            {
              paddingTop: Math.max(insets.top, 12),
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? (
              <Text
                style={[
                  styles.subtitle,
                  subtitleTone === "accent" && styles.subtitleAccent,
                ]}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>

          <ScrollView
            style={styles.itemsScroll}
            contentContainerStyle={styles.items}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.item,
                  item.destructive && styles.itemDestructive,
                ]}
                activeOpacity={0.8}
                onPress={() => runItem(item.onPress)}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={item.destructive ? "#B91C1C" : "#1E3A8A"}
                />
                <Text
                  style={[
                    styles.itemText,
                    item.destructive && styles.itemTextDestructive,
                  ]}
                >
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.closeText}>{t("common.close")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: APP_MENU_BACKDROP,
  },
  panel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: isWeb ? DRAWER_WIDTH : 300,
    maxWidth: isWeb ? DRAWER_WIDTH : "88%",
    backgroundColor: "#FFFFFF",
    zIndex: 2,
    ...platformShadowDrawer(),
  },
  header: {
    backgroundColor: "#1E3A8A",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 14,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#BFDBFE",
  },
  subtitleAccent: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FCA5A5",
  },
  itemsScroll: {
    flex: 1,
  },
  items: {
    paddingHorizontal: 14,
    gap: 8,
    paddingBottom: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 13,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
  },
  itemDestructive: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    lineHeight: 20,
  },
  itemTextDestructive: {
    color: "#B91C1C",
  },
  closeBtn: {
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
  },
  closeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
});
