import { Platform, StyleSheet } from "react-native";

export const palette = {
  bg: "#F7F8FA",
  card: "#FFFFFF",
  border: "#E6E8EC",
  text: "#1F2937",
  subtext: "#5F6B7A",
  primary: "#2563EB",
  primaryText: "#FFFFFF",
  danger: "#EF4444",
  amber: "#F59E0B",
  ok: "#10B981",
  backdrop: "rgba(0,0,0,0.35)",
  shared: "#0EA5E9",
};

export const shadow = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  android: { elevation: 2 },
  default: {},
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: palette.text,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  input: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 12, android: 10, default: 11 }),
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.text,
  },
  primaryBtn: {
    backgroundColor: palette.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
    ...shadow,
  },
  primaryBtnText: { color: palette.primaryText, fontWeight: "700" },
  secondaryBtn: {
    backgroundColor: "#F2F4F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryBtnText: { color: palette.text, fontWeight: "600" },
  listPad: { padding: 16, paddingTop: 6 },

  card: {
    backgroundColor: palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
    ...shadow,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerChips: { flexDirection: "row", gap: 8 },
  itemName: { fontSize: 16, fontWeight: "700", color: palette.text, flexShrink: 1 },

  metaRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  metaLabel: { width: 74, color: palette.subtext },
  metaValue: { color: palette.text, flexShrink: 1 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  badgeText: { fontSize: 12, fontWeight: "700", color: palette.text },
  badgeExpired: { backgroundColor: "#FEE2E2", borderColor: "#FECACA" },
  badgeSoon: { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" },
  badgeOk: { backgroundColor: "#D1FAE5", borderColor: "#A7F3D0" },

  badgeShared: { backgroundColor: "#E0F2FE", borderColor: "#BAE6FD" },
  badgeSharedText: { fontSize: 12, fontWeight: "800", color: "#0369A1" },

  swipeDelete: { justifyContent: "center", alignItems: "flex-end" },
  swipeDeleteBtn: {
    backgroundColor: palette.danger,
    width: 96,
    height: "90%",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  swipeDeleteText: { color: "#FFF", fontWeight: "800" },

  emptyText: { color: palette.subtext, textAlign: "center", marginTop: 24 },

  modalBackdrop: { flex: 1, backgroundColor: palette.backdrop, justifyContent: "center", padding: 16 },
  modalCard: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: palette.border, padding: 16, ...shadow },
  modalTitle: { fontSize: 18, fontWeight: "800", color: palette.text, marginBottom: 8 },
  modalBtns: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  fieldLabel: { color: palette.subtext, marginTop: 10, marginBottom: 6 },

  shareRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14 },
  shareTitle: { color: palette.text, fontWeight: "700", marginBottom: 2 },
  shareHint: { color: palette.subtext, fontSize: 12 },
  shareBlocked: { color: palette.danger, fontSize: 12, marginTop: 4 },
  // recentChip: {
  //   paddingHorizontal: 10,
  //   paddingVertical: 6,
  //   borderRadius: 999,
  //   backgroundColor: "#F3F4F6",
  //   borderWidth: 1,
  //   borderColor: "#E5E7EB",
  //   marginRight: 8,
  // },
  // recentChipText: { color: "#111827", fontWeight: "600" }
  
  sectionLabel: {
    marginTop: 10,
    marginBottom: 6,
    color: "#6B7280",       // muted gray
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#EEF2F7",
    marginBottom: 8,
    borderRadius: 1,
  },

  recentRow: {
    gap: 8,
    paddingRight: 4,
  },
  recentChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F5F7FA",  // softer than inputs
    borderWidth: 1,
    borderColor: "#E5EAF0",
  },
  recentChipText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
    maxWidth: 160,          // long text won’t blow up layout
  },
});