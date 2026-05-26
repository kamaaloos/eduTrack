import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function HomeworkCard({
  item,
}: any) {

  const badgeColor =
    item.daysLeft <= 1
      ? "#FEE2E2"
      : item.daysLeft <= 3
      ? "#FEF3C7"
      : "#DCFCE7";

  const textColor =
    item.daysLeft <= 1
      ? "#DC2626"
      : item.daysLeft <= 3
      ? "#D97706"
      : "#16A34A";

  return (

    <View style={styles.card}>

      <View style={styles.header}>

        <Text style={styles.subject}>
          {item.subject}
        </Text>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: badgeColor,
            },
          ]}
        >

          <Text
            style={{
              color: textColor,
              fontWeight: "700",
            }}
          >
            {item.daysLeft}d
          </Text>

        </View>

      </View>

      <Text style={styles.title}>
        {item.title}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  card: {
    backgroundColor: "white",
    width: 260,
    padding: 16,
    borderRadius: 18,
    marginRight: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  subject: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  title: {
    color: "#6B7280",
    lineHeight: 20,
  },
});