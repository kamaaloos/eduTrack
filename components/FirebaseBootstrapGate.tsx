import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { isFirebaseConfigured } from "../src/services/firebase";

type FirebaseBootstrapGateProps = {
  children: React.ReactNode;
};

export function FirebaseBootstrapGate({ children }: FirebaseBootstrapGateProps) {
  const { t } = useTranslation();

  if (!isFirebaseConfigured()) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t("common.firebaseConfigMissingTitle")}</Text>
        <Text style={styles.message}>{t("common.firebaseConfigMissingHint")}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#6B9FD4",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: "#EFF6FF",
    textAlign: "center",
  },
});
