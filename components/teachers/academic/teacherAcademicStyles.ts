import { StyleSheet } from "react-native";

export const teacherAcademicStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    backgroundColor: "#1E3A8A",
    paddingTop: 55,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#DBEAFE",
    marginTop: 6,
    fontSize: 14,
  },
  tabsRow: {
    marginTop: 20,
    paddingHorizontal: 16,
    maxHeight: 60,
  },
  tabButton: {
    backgroundColor: "white",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    height: 42,
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#2563EB",
  },
  tabText: {
    color: "#374151",
    fontWeight: "600",
  },
  activeTabText: {
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
  },
  classCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  classLoader: {
    paddingVertical: 12,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
    marginTop: 4,
  },
  fieldHint: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 8,
    lineHeight: 18,
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 20,
  },
  noClassesText: {
    color: "#EF4444",
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 20,
  },
  selectedHint: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  subjectWarn: {
    fontSize: 13,
    color: "#B45309",
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    lineHeight: 18,
  },
  scrollBottomSpacer: { height: 80 },
});
