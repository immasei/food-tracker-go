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

export const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#000",    
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  container: { flex: 1, backgroundColor: "#000" },
  progressBox: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 },
  progressTitle: { color: "#C7F9CC", fontWeight: "800", marginBottom: 8 },
  progressLine: { color: "#C7F9CC" },

  cameraWrap: { 
    flex:1, 
    marginTop: 12, 
    marginLeft: 12, 
    marginRight: 12, 
    marginBottom: 2,
    borderRadius: 16, 
    overflow: "hidden", 
    borderWidth: 1, 
    borderColor: "#1f2937"
  },
  shutterBar: {
    position: "absolute", bottom: 12, left: 0, right: 0,
    flexDirection: "row", justifyContent: "center", gap: 12,
  },

  btn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, ...shadow },
  btnPrimary: { backgroundColor: palette.primary },
  btnGrey: { backgroundColor: "#6B7280" },
  btnText: { color: "#fff", fontWeight: "800" },

  thumb: { width: 96, height: 96, marginRight: 10, borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: "#1f2937" },
  thumbBadge: {
    position: "absolute", left: 6, bottom: 6, backgroundColor: "#60A5FA",
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  thumbBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },

  bottomBar: {
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: Platform.select({ ios: 18, default: 12 }),
  },
  action: { flex: 1, marginHorizontal: 6, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  actionText: { color: "#fff", fontWeight: "800" },
  resume: { backgroundColor: "#5B7CF0" },
  edit: { backgroundColor: "#60A5FA" },
  add: { backgroundColor: "#006A67" },
  reset: { backgroundColor: "#FDEB9E" },
  addDisabled: { backgroundColor: "#9CA3AF" },

  processing: {
    position: "absolute", right: 14, top: 14,
    backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10,
  },
  message: {
    color: "#ffffff", 
    marginBottom: 8
  },
});