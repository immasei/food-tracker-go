import React, { useEffect, useState, useContext } from "react";
import { Alert, FlatList, Pressable, SafeAreaView, Text, TextInput, View, StyleSheet, Platform } from "react-native";
import { useToast } from "../../components/Toast";
import FoodCard from "./components/FoodCard";
import EditItemModal from "./components/EditItemModal";
import { shadow, palette } from "./styles";
import { Food } from "./types/food";
import { NAMES_KEY, CATS_KEY, loadRecents } from "./utils/recents";
import { deleteItem, upsertItem } from "./utils/firebase";
import { useFoodItems } from "./utils/hooks";
import { AuthContext } from "../../contexts/AuthContext";

const FoodListTab: React.FC = () => {
  const { show, Toast } = useToast();
  
  const { user } = useContext(AuthContext);
  const USER_ID = user.uid;
  
  const [search, setSearch] = useState("");
  const { filteredSorted } = useFoodItems(search, USER_ID);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);

  const [recentNames, setRecentNames] = useState<string[]>([]);
  const [recentCats, setRecentCats] = useState<string[]>([]);
  
  useEffect(() => {
    (async () => {
      setRecentNames(await loadRecents(NAMES_KEY(USER_ID)));
      setRecentCats(await loadRecents(CATS_KEY(USER_ID)));
    })();
  }, []);

  const openCreate = () => {
    setEditing({
      id: "",
      userId: USER_ID,
      name: "",
      expiryDate: "",
      category: "",
      createdAt: new Date().toISOString(),
      shared: false,
    });
    setModalOpen(true);
  };

  const openEdit = (item: Food) => {
    setEditing({ ...item });
    setModalOpen(true);
  };

  const removeItem = async (id: string) => {
    try {
      await deleteItem(id);
      show("Delete OK.", "danger");
    } catch (e) {
      Alert.alert("Delete failed", String(e));
    }
  };

  const saveItem = async () => {
    if (!editing) return;

    const { id, name, expiryDate, category, shared } = editing;

    // if expiryDate is provided, ensure YYYY-MM-DD. allow blank tho
    if (expiryDate && expiryDate.trim().length > 0) {
      const ok = /^\d{4}-\d{2}-\d{2}$/.test(expiryDate.trim());
      if (!ok) {
        Alert.alert("Invalid date", "Use format YYYY-MM-DD.");
        // show("Invalid date", "danger");
        return;
      }
    }

    try {
      const { recentNames, recentCats } = await upsertItem(editing, USER_ID);
      setRecentNames(recentNames);
      setRecentCats(recentCats);

      setModalOpen(false);
      setEditing(null);
      show("Saved OK.", "success");
    } catch (e) {
      Alert.alert("Save failed", String(e));
    }
  };

  const renderItem = ({ item }: { item: Food }) => (
    <FoodCard
      item={item}
      onPress={() => openEdit(item)}
      onDelete={() => removeItem(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search by name or category"
          placeholderTextColor="#9AA0A6"
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
        <Pressable onPress={openCreate} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredSorted}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ padding: 16, paddingTop: 6 }}
        ListEmptyComponent={<Text style={styles.emptyText}>
          Nothing here yet. Add your first item.
        </Text>}
      />

      <EditItemModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={saveItem}
        editing={editing}
        setEditing={setEditing}
        recentNames={recentNames}
        recentCats={recentCats}
        showToast={(msg, tone) => show(msg, tone as any)}
      />

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg },
    searchRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
    emptyText: { color: palette.subtext, textAlign: "center", marginTop: 24 },
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

});

export default FoodListTab;
