import { Ionicons } from "@expo/vector-icons";
import { useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";

type SwipeToDeleteRowProps = {
  children: ReactNode;
  onDelete: () => void;
  enabled?: boolean;
  /** list — swipe left (vertical lists). carousel — swipe right (horizontal rows). */
  variant?: "list" | "carousel";
  /** Web dismiss button accessibility label (defaults to common.delete). */
  webDismissLabel?: string;
};

export function SwipeToDeleteRow({
  children,
  onDelete,
  enabled = true,
  variant = "list",
  webDismissLabel,
}: SwipeToDeleteRowProps) {
  const { t } = useTranslation();
  const swipeRef = useRef<Swipeable>(null);
  const dismissA11y = webDismissLabel ?? t("common.delete");

  if (!enabled) {
    return <>{children}</>;
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.webRow}>
        <View style={styles.webContent}>{children}</View>
        <TouchableOpacity
          style={styles.webDismissBtn}
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={dismissA11y}
        >
          <Ionicons name="close-circle-outline" size={22} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    );
  }

  const handleDelete = () => {
    swipeRef.current?.close();
    onDelete();
  };

  const deleteAction = (
    <TouchableOpacity
      style={[
        styles.deleteAction,
        variant === "carousel" ? styles.deleteActionCarousel : null,
      ]}
      onPress={handleDelete}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={dismissA11y}
    >
      <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
      <Text style={styles.deleteText}>{t("common.delete")}</Text>
    </TouchableOpacity>
  );

  const isCarousel = variant === "carousel";

  return (
    <View style={isCarousel ? styles.rowCarousel : styles.row}>
      <Swipeable
        ref={swipeRef}
        renderRightActions={isCarousel ? undefined : () => deleteAction}
        renderLeftActions={isCarousel ? () => deleteAction : undefined}
        friction={2}
        overshootRight={false}
        overshootLeft={false}
      >
        {children}
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
  },
  rowCarousel: {
    flexShrink: 0,
  },
  webRow: {
    width: "100%",
    position: "relative",
  },
  webContent: {
    width: "100%",
  },
  webDismissBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  deleteAction: {
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    width: 88,
    marginBottom: 12,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    gap: 4,
  },
  deleteActionCarousel: {
    marginBottom: 0,
    marginRight: 12,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  deleteText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
