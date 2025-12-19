// (tracker)/components/EditItemModal.tsx
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Food } from "@/types/food";
import { daysLeft, isExpired } from "@/utils/dates";
import { palette, shadow } from "../styles";

type Props = {
  item: Food;
  onPress: () => void;
  onDelete: () => void;
};

const RightActions = ({ onDelete }: { onDelete: () => void }) => (
  <View style={styles.swipeDelete}>
    <Pressable onPress={onDelete} style={styles.swipeDeleteBtn}>
      <Text style={styles.swipeDeleteText}>Delete</Text>
    </Pressable>
  </View>
);

// choose badge style based on expiry (null/empty = never expires)
const statusStyle = (iso: string | null | undefined) => {
  // no expiry date
  if (!iso || !iso.trim?.())
    return [styles.badge, styles.badgeNone];

  if (isExpired(iso)) 
    return [styles.badge, styles.badgeExpired];
    
  const d = daysLeft(iso);
  if (Number.isFinite(d) && d <= 3) 
    return [styles.badge, styles.badgeSoon];
    
  return [styles.badge, styles.badgeOk];
};

// text for badge
const statusText = (iso: string | null | undefined) => {
  if (!iso || !iso.trim?.()) return "No expiry";
  return isExpired(iso) ? "Expired" : `${daysLeft(iso)}d left`;
};

export default function FoodCard({ item, onPress, onDelete }: Props) {
  const displayName = item.name?.trim() || "(Unnamed)";
  const displayCategory = item.category?.trim() || "—";
  const displayExpiry = item.expiryDate?.trim() || "—";

  return (
    <Swipeable renderRightActions={() => <RightActions onDelete={onDelete} />}>
      <Pressable style={styles.card} onPress={onPress}>
        <View style={styles.cardHeader}>
          <Text style={styles.itemName}>{displayName}</Text>
          <View style={styles.headerChips}>
            {item.shared && (
              <View style={[styles.badge, styles.badgeShared]}>
                <Text style={styles.badgeSharedText}>Shared</Text>
              </View>
            )}
            <View style={statusStyle(item.expiryDate)}>
              <Text style={styles.badgeText}>{statusText(item.expiryDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Category</Text>
          <Text style={styles.metaValue}>{displayCategory}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Expiry</Text>
          <Text style={styles.metaValue}>{displayExpiry}</Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  badgeText: { fontSize: 12, fontWeight: "700", color: palette.text },
  badgeExpired: { backgroundColor: "#FEE2E2", borderColor: "#FECACA" },
  badgeSoon: { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" },
  badgeOk: { backgroundColor: "#D1FAE5", borderColor: "#A7F3D0" },
  badgeNone: { backgroundColor: "#8a8a8a27", borderColor: "#bcbcbcff" },

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
});