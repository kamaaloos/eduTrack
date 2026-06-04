import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { ParentChild } from "../../src/services/parentChildren";
import { platformShadow } from "../../src/utils/platformShadow";
import { UserAvatar } from "../common/UserAvatar";

type ParentChildrenListProps = {
  children: ParentChild[];
  onSelect: (child: ParentChild) => void;
};

export function ParentChildrenList({
  children,
  onSelect,
}: ParentChildrenListProps) {
  const { t } = useTranslation();
  const isWeb = Platform.OS === "web";

  const renderCard = (child: ParentChild) => (
    <TouchableOpacity
      key={child.id}
      style={[
        styles.childCard,
        isWeb ? styles.childCardWeb : styles.childCardMobile,
      ]}
      onPress={() => onSelect(child)}
      activeOpacity={0.88}
    >
      <UserAvatar
        name={child.name}
        email={child.email}
        photoURL={child.photoURL}
        size={isWeb ? 56 : 52}
        textColor="#1E3A8A"
        backgroundColor="#EFF6FF"
      />
      <View style={[styles.childBody, !isWeb && styles.childBodyMobile]}>
        <Text
          style={[styles.childName, !isWeb && styles.childNameMobile]}
          numberOfLines={2}
        >
          {child.name}
        </Text>
        <View style={styles.classPill}>
          <Ionicons name="school-outline" size={12} color="#1D4ED8" />
          <Text style={styles.classPillText} numberOfLines={1}>
            {child.className || child.classId || t("common.class")}
          </Text>
        </View>
        {isWeb && child.email ? (
          <Text style={styles.childEmail} numberOfLines={1}>
            {child.email}
          </Text>
        ) : null}
        <Text style={styles.viewLink}>{t("parent.viewStudent")} →</Text>
      </View>
      {isWeb ? (
        <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{t("parent.selectChild")}</Text>
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>{children.length}</Text>
        </View>
      </View>

      {isWeb ? (
        <View style={styles.webGrid}>{children.map(renderCard)}</View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mobileRow}
          nestedScrollEnabled
          {...(Platform.OS === "web"
            ? ({ className: "dashboard-hide-scrollbar" } as object)
            : null)}
        >
          {children.map(renderCard)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  countPill: {
    backgroundColor: "#EFF6FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  countPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  webGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    maxWidth: 680,
    alignSelf: "center",
    width: "100%",
  },
  mobileRow: {
    paddingRight: 4,
    gap: 12,
  },
  childCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
    ...platformShadow("sm"),
  },
  childCardMobile: {
    width: 172,
    padding: 14,
    flexShrink: 0,
    flexDirection: "column",
    alignItems: "flex-start",
    minHeight: 168,
    justifyContent: "space-between",
  },
  childCardWeb: {
    flexGrow: 1,
    flexBasis: "48%",
    minWidth: 280,
    maxWidth: 334,
    padding: 16,
  },
  childBody: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  childBodyMobile: {
    flex: undefined,
    width: "100%",
    marginTop: 10,
  },
  childName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  childNameMobile: {
    fontSize: 15,
    lineHeight: 20,
  },
  classPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    maxWidth: "100%",
    backgroundColor: "#EFF6FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  classPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1D4ED8",
    flexShrink: 1,
  },
  childEmail: {
    fontSize: 12,
    color: "#64748B",
  },
  viewLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
    marginTop: 2,
  },
});
