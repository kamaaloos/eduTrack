import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { APP_MENU_BACKDROP } from "../../src/constants/appTheme";

export type AdminSideMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type AdminSideMenuProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string | null;
  /** Use `accent` for school name (red highlight on the blue header). */
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.panel}>
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

          <View style={styles.items}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.item}
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  item.onPress();
                }}
              >
                <Ionicons name={item.icon} size={20} color="#1E3A8A" />
                <Text style={styles.itemText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.closeText}>{t("common.cancel")}</Text>
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
    width: 300,
    maxWidth: "82%",
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  header: {
    backgroundColor: "#1E3A8A",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#BFDBFE",
  },
  subtitleAccent: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FCA5A5",
  },
  items: {
    marginTop: 14,
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  closeBtn: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    backgroundColor: "#DBEAFE",
  },
  closeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E3A8A",
  },
});
