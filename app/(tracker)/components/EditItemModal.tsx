// (tracker)/components/EditItemModal.tsx
import React from "react";
import { Modal, Platform, Pressable, ScrollView, Switch, Text, TextInput, View, StyleSheet, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Food } from "@/types/food";
import { isExpired } from "@/utils/dates";
import { shadow, palette } from "../styles";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  editing: Food | null;
  setEditing: React.Dispatch<React.SetStateAction<Food | null>>;
  recentNames: string[];
  recentCats: string[];
  showToast: (msg: string, tone?: "success" | "warning" | "danger") => void;
};

export default function EditItemModal({
  visible, onClose, onSave, editing, setEditing, recentNames, recentCats, showToast,
}: Props) {
  const expiredInEdit = isExpired(editing?.expiryDate ?? "");

  return (
    <Modal 
      transparent 
      animationType="fade" 
      visible={visible} 
      onRequestClose={onClose}
      presentationStyle="overFullScreen" 
      statusBarTranslucent
    >
      <SafeAreaView style={styles.modalBackdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "position" : "height"}
          keyboardVerticalOffset={Platform.select({ ios: 12, android: 0, default: 0 })}
        >
          <View style={styles.modalCard}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: palette.text, marginBottom: 8 }}>
              {editing && editing.id ? "Edit item" : "Add item"}
            </Text>

            <Text style={{ color: palette.subtext, marginTop: 10, marginBottom: 6 }}>Name</Text>
            <TextInput
              style={styles.input}
              value={editing?.name ?? ""}
              onChangeText={(t) => setEditing(e => (e ? { ...e, name: t } : e))}
            />

            {recentNames.length > 0 && (
              <>
                <Text style={{ color: palette.subtext, marginTop: 10, marginBottom: 6 }}>Recent Names</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                  {recentNames.map((n, i) => (
                    <Pressable
                      key={`rn-${i}`}
                      onPress={() => setEditing(e => (e ? { ...e, name: n } : e))}
                      style={{
                        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
                        backgroundColor: "#F5F7FA", borderWidth: 1, borderColor: "#E5EAF0", marginRight: 8,
                      }}
                    >
                      <Text style={{ color: "#374151", fontWeight: "600", fontSize: 13, maxWidth: 160 }}>{n}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={{ color: palette.subtext, marginTop: 10, marginBottom: 6 }}>Expiry (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={editing?.expiryDate ?? ""}
              onChangeText={(t) => setEditing(e => (e ? { ...e, expiryDate: t } : e))}
              keyboardType={Platform.select({ ios: "numbers-and-punctuation", default: "numeric" })}
            />

            <Text style={{ color: palette.subtext, marginTop: 10, marginBottom: 6 }}>Category</Text>
            <TextInput
              style={styles.input}
              value={editing?.category ?? ""}
              onChangeText={(t) => setEditing(e => (e ? { ...e, category: t } : e))}
            />

            {recentCats.length > 0 && (
              <>
                <Text style={{ color: palette.subtext, marginTop: 10, marginBottom: 6 }}>Recent Categories</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                  {recentCats.map((c, i) => (
                    <Pressable
                      key={`rc-${i}`}
                      onPress={() => setEditing(e => (e ? { ...e, category: c } : e))}
                      style={{
                        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
                        backgroundColor: "#F5F7FA", borderWidth: 1, borderColor: "#E5EAF0", marginRight: 8,
                      }}
                    >
                      <Text style={{ color: "#374151", fontWeight: "600", fontSize: 13, maxWidth: 160 }}>{c}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Share toggle & disclaimer */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.text, fontWeight: "700", marginBottom: 2 }}>Share this item</Text>
                <Text style={{ color: palette.subtext, fontSize: 12 }}>
                  Sharing reveals your phone number to others. You can change this in Settings later.
                </Text>
                {expiredInEdit && (
                  <Text style={{ color: palette.danger, fontSize: 12, marginTop: 4 }}>
                    Expired items can’t be shared.
                  </Text>
                )}
              </View>
              <Switch
                value={!!editing?.shared}
                onValueChange={(v) => {
                  if (expiredInEdit && v) {
                    showToast("Expired items cant be shared.", "warning");
                    return;
                  }
                  setEditing(e => (e ? { ...e, shared: v } : e));
                }}
                disabled={expiredInEdit}
              />
            </View>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <Pressable style={styles.secondaryBtn} onPress={onClose}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={onSave}>
                <Text style={styles.primaryBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 12, android: 10, default: 11 }),
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.text,
  },
  modalBackdrop: { flex: 1, backgroundColor: palette.backdrop, justifyContent: "center", padding: 16 },
  modalCard: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: palette.border, padding: 16, ...shadow },
  modalTitle: { fontSize: 18, fontWeight: "800", color: palette.text, marginBottom: 8 },
  modalBtns: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
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
  
});