import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FAQ_ITEM_KEYS, type FaqItemKey } from "../../src/constants/faqItems";

export function FaqAccordion() {
  const { t } = useTranslation();
  const [openKey, setOpenKey] = useState<FaqItemKey | null>(FAQ_ITEM_KEYS[0]);

  return (
    <View style={styles.list}>
      {FAQ_ITEM_KEYS.map((key) => {
        const open = openKey === key;
        return (
          <View key={key} style={styles.item}>
            <TouchableOpacity
              style={[styles.questionRow, open && styles.questionRowOpen]}
              onPress={() => setOpenKey(open ? null : key)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
            >
              <Text style={styles.question}>
                {t(`faq.items.${key}.question`)}
              </Text>
              <Ionicons
                name={open ? "chevron-up" : "chevron-down"}
                size={18}
                color="#1E3A8A"
              />
            </TouchableOpacity>
            {open ? (
              <View style={styles.answerWrap}>
                <Text style={styles.answer}>
                  {t(`faq.items.${key}.answer`)}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  item: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F8FAFC",
  },
  questionRowOpen: {
    backgroundColor: "#EFF6FF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 22,
  },
  answerWrap: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  answer: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
  },
});
