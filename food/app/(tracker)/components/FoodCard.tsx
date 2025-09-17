import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { daysLeft, isExpired } from "../utils/dates";
import { Food } from "../types/food";
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

const statusStyle = (iso: string) => {
    if (isExpired(iso)) 
        return [styles.badge, styles.badgeExpired];
    
    const d = daysLeft(iso);
    if (d <= 2) 
        return [styles.badge, styles.badgeSoon];
    
    return [styles.badge, styles.badgeOk];
  };

const statusText = (iso: string) => (isExpired(iso) ? "Expired" : `${daysLeft(iso)}d left`);

export default function FoodCard({ item, onPress, onDelete }: Props) {
  return (
    <Swipeable renderRightActions={() => <RightActions onDelete={onDelete} />}>
      <Pressable style={styles.card} onPress={onPress}>
        <View style={styles.cardHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
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
          <Text style={styles.metaValue}>{item.category}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Expiry</Text>
          <Text style={styles.metaValue}>{item.expiryDate}</Text>
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