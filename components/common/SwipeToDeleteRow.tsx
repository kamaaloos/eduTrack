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
};

export function SwipeToDeleteRow({
  children,
  onDelete,
  enabled = true,
  variant = "list",
}: SwipeToDeleteRowProps) {
  const { t } = useTranslation();
  const swipeRef = useRef<Swipeable>(null);

  if (!enabled || Platform.OS === "web") {
    return <>{children}</>;
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
      accessibilityLabel={t("common.delete")}
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
