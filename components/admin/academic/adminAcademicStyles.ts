import { StyleSheet } from "react-native";

export const adminAcademicStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  noticeCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  noticeTitle: { fontSize: 17, fontWeight: "800", color: "#92400E", marginBottom: 8 },
  noticeText: { fontSize: 14, color: "#78350F", lineHeight: 20, marginBottom: 12 },
  noticeBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  noticeBtnText: { color: "#FFFFFF", fontWeight: "700" },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  button: { backgroundColor: "#007AFF", padding: 12, borderRadius: 10 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "600" },
});
