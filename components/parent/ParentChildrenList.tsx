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
import { MOBILE_SCREEN_HORIZONTAL_PADDING } from "../../src/constants/appTheme";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";
import type { ParentChild } from "../../src/services/parentChildren";
import { platformShadow } from "../../src/utils/platformShadow";
import { UserAvatar } from "../common/UserAvatar";

type ParentChildrenListProps = {
  childList: ParentChild[];
  onSelect: (child: ParentChild) => void;
};

export function ParentChildrenList({
  childList,
  onSelect,
}: ParentChildrenListProps) {
  const { t } = useTranslation();
  const { theme } = useSchoolTheme();
  const primary = theme.primaryColor;
  const softBg = `${primary}14`;
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
        textColor={primary}
        backgroundColor={softBg}
      />
      <View style={[styles.childBody, !isWeb && styles.childBodyMobile]}>
        <Text
          style={[styles.childName, !isWeb && styles.childNameMobile]}
          numberOfLines={2}
        >
          {child.name}
        </Text>
        <View style={[styles.classPill, { backgroundColor: softBg }]}>
          <Ionicons name="school-outline" size={12} color={primary} />
          <Text
            style={[styles.classPillText, { color: primary }]}
            numberOfLines={1}
          >
            {child.className || child.classId || t("common.class")}
          </Text>
        </View>
        {isWeb && child.email ? (
          <Text style={styles.childEmail} numberOfLines={1}>
            {child.email}
          </Text>
        ) : null}
        <Text style={[styles.viewLink, { color: primary }]}>
          {t("parent.viewStudent")} →
        </Text>
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
        <View
          style={[
            styles.countPill,
            { backgroundColor: softBg, borderColor: `${primary}55` },
          ]}
        >
          <Text style={[styles.countPillText, { color: primary }]}>
            {childList.length}
          </Text>
        </View>
      </View>

      {isWeb ? (
        <View style={styles.webGrid}>{childList.map(renderCard)}</View>
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
          {childList.map(renderCard)}
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
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
  },
  countPillText: {
    fontSize: 12,
    fontWeight: "800",
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
    paddingHorizontal: MOBILE_SCREEN_HORIZONTAL_PADDING,
    paddingRight: MOBILE_SCREEN_HORIZONTAL_PADDING + 4,
    gap: 12,
  },
  childCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    gap: 12,
    ...platformShadow("sm"),
  },
  childCardMobile: {
    width: 172,
    maxWidth: 172,
    padding: 14,
    flexShrink: 0,
    alignSelf: "flex-start",
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
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  classPillText: {
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  childEmail: {
    fontSize: 12,
    color: "#64748B",
  },
  viewLink: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
});
