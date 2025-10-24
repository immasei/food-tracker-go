// app/(nearby)/NearbyDiscovery.tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable, FlatList, Modal, TouchableOpacity, Alert} from "react-native";
import MapView, { Marker, Callout, Region, LatLng, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/contexts/AuthContext";
import AddressPicker from "@/components/AddressPicker";
import { daysLeft, isExpired } from "@/utils/dates";
import { fetchSharedFood, fetchSharedFoodCount } from "@/services/foodService";
import { fetchNearbyUsers, fetchUser } from "@/services/userService";
import { Food } from "@/types/food";
import { User } from "@/types/user";
import { kmToLatDelta, kmToLngDelta } from '@/utils/distances';

export default function NearbyDiscovery() {
  const { user } = React.useContext(AuthContext);
  const USER_ID = user?.uid as string;

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<User | null>(null);

  // --- current map center (orange pin + 5km circle)
  const [center, setCenter] = useState<LatLng | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  const RADIUS_KM = 5;
  const [others, setOthers] = useState<User[]>([]);

  // --- bottom sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sharedList, setSharedList] = useState<Food[]>([]);
  const [loadingSheet, setLoadingSheet] = useState(false);

  // --- reload status
  const [reloading, setReloading] = useState(false);

  // --- pull-to-refresh for sheet list
  const [listRefreshing, setListRefreshing] = useState(false);

  // --- fully reload the screen (GPS -> center -> others)
  const reloadAll = useCallback(async () => {
    setReloading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setCenter(c);
      setRegion({
        latitude: c.latitude,
        longitude: c.longitude,
        latitudeDelta: kmToLatDelta(RADIUS_KM * 2),
        longitudeDelta: kmToLngDelta(RADIUS_KM * 2, c.latitude),
      });
      const meDoc = await fetchUser(USER_ID);
      setMe(meDoc);
      const users = await fetchNearbyUsers(c, RADIUS_KM, USER_ID);
      const withShared = await Promise.all(
      users.map(async (u) => {
          const count = await fetchSharedFoodCount(u.id);
          return count > 0 ? u : null;
        })
      );

      // remove nulls (users with 0 shared food)
      const filtered = withShared.filter(Boolean) as User[];
      setOthers(filtered);
    } finally {
      setReloading(false);
    }
  }, [USER_ID]);

  // --- refresh the shared list for the currently selected user (pull to refresh)
  const refreshSharedList = useCallback(async () => {
    if (!selectedUser) return;
    setListRefreshing(true);
    try {
      const list = await fetchSharedFood(selectedUser.id);
      setSharedList(list);
    } finally {
      setListRefreshing(false);
    }
  }, [selectedUser]);

  // 1) Always start with CURRENT GPS for initial center (not stored)
  useEffect(() => {
    (async () => {
      try {
        const meDoc = await fetchUser(USER_ID);
        setMe(meDoc);

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Location needed", "Please enable location to see nearby shared food.");
          setLoading(false);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setCenter(c);
        setRegion({
          latitude: c.latitude,
          longitude: c.longitude,
          latitudeDelta: kmToLatDelta(RADIUS_KM * 2),
          longitudeDelta: kmToLngDelta(RADIUS_KM * 2, c.latitude),
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [USER_ID]);

  // 2) Fetch others on center change
  useEffect(() => {
    if (!center) return;
    (async () => {
      const users = await fetchNearbyUsers(center, RADIUS_KM, USER_ID);
      const withShared = await Promise.all(
      users.map(async (u) => {
          const count = await fetchSharedFoodCount(u.id);
          return count > 0 ? u : null;
        })
      );

      // remove nulls (users with 0 shared food)
      const filtered = withShared.filter(Boolean) as User[];
      setOthers(filtered);
    })();
  }, [center, USER_ID]);

  const onLongPress = useCallback((e: any) => {
    const c = e.nativeEvent.coordinate as LatLng;
    setCenter(c);
    setRegion((r) =>
      r
        ? { ...r, latitude: c.latitude, longitude: c.longitude }
        : {
            latitude: c.latitude,
            longitude: c.longitude,
            latitudeDelta: kmToLatDelta(RADIUS_KM * 2),
            longitudeDelta: kmToLngDelta(RADIUS_KM * 2, c.latitude),
          }
    );
  }, []);

  const openUserSheet = useCallback(async (u: User) => {
    setSelectedUser(u);
    setLoadingSheet(true);
    setSheetOpen(true);
    try {
      const list = await fetchSharedFood(u.id);
      setSharedList(list);
    } finally {
      setLoadingSheet(false);
    }
  }, []);

  if (loading || !region || !center) {
    return (
      <View style={[styles.fill, styles.center]}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading map…</Text>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      {/* set map center pin: address picker */}
      <View style={styles.searchBar}>
        <AddressPicker
          onPicked={(picked) => {
            const c = { latitude: picked.lat, longitude: picked.lng };
            setCenter(c);
            setRegion((r) => (r ? { ...r, latitude: c.latitude, longitude: c.longitude } : r));
          }}
          onOpenChange={() => {}}
        />
       
      </View>

      {/* Legend */}
      {/* Bottom-left group: legend (card) + reload (card) */}
<View style={styles.bottomGroup}>
  <View style={styles.legend}>
    <View style={styles.legendRow}>
      <View style={[styles.dot, { backgroundColor: "#DC2626", marginLeft: 2 }]} />
      <Text style={styles.legendText}>Other users</Text>
    </View>
    <View style={styles.legendRow}>
      <View style={[styles.dot, { backgroundColor: "#2563EB", marginLeft: 2 }]} />
      <Text style={styles.legendText}>You</Text>
    </View>
    <View style={styles.legendRow}>
      <View style={[styles.dot, { backgroundColor: "#F59E0B", marginLeft: 2 }]} />
      <Text style={styles.legendText}>Map center (5km)</Text>
    </View>
    <View style={styles.legendRow}>
      <Ionicons name="locate-outline" size={14} style={{ marginLeft: 0, marginRight: 6 }} />
      <Text style={styles.legendText}>Use current</Text>
    </View>
  </View>

  {/* Separate card, sits UNDER the legend */}
  <Pressable style={styles.reloadBtn} onPress={reloadAll} disabled={reloading}>
    <Ionicons name="refresh" size={18} />
    <Text style={{ marginLeft: 6, fontWeight: "600" }}>
      {reloading ? "Reloading…" : "Reload"}
    </Text>
  </Pressable>
</View>


      
      {/* map */}
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion as any}
        onLongPress={onLongPress}
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {/* 5 km circle around current map center */}
        <Circle
          center={center}
          radius={5000}
          strokeColor="rgba(245,158,11,0.8)"
          fillColor="rgba(245,158,11,0.12)"
          strokeWidth={2}
        />

        {/* Orange pin: current map center */}
        <Marker
          coordinate={center}
          pinColor="#F59E0B"
          title="Map center"
          description="Long-press map to move; or search."
        />

        {/* Blue pin: your saved user location (if any) */}
        {me?.location?.lat != null && me.location.lng != null && (
          <Marker
            coordinate={{ latitude: me.location.lat!, longitude: me.location.lng! }}
            pinColor="#2563EB"
            onPress={() => openUserSheet(me)}
          >
            <Callout><Text>Me: {me.username ?? "(You)"}</Text></Callout>
          </Marker>
        )}

        {/* Red pins: other users within 5 km of center */}
        {others.map((u) => {
          const loc = u.location!;
          return (
            <Marker
              key={u.id}
              coordinate={{ latitude: loc.lat!, longitude: loc.lng! }}
              pinColor="#DC2626"
              onPress={() => openUserSheet(u)}
            >
              <Callout>
                <Text>{u.username ?? "User"}</Text>
                <Text>Tap for details →</Text>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* "use current" icon button */}
      <Pressable
        accessibilityLabel="Use current location"
        style={styles.fab}
        onPress={async () => {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") return;
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setCenter(c);
          setRegion((r) => (r ? { ...r, latitude: c.latitude, longitude: c.longitude } : r));
        }}
        >
        <Ionicons name="locate-outline" size={28} />
      </Pressable>


      {/* bottom sheet (modal slideup) */}
      <Modal visible={sheetOpen} animationType="slide" transparent onRequestClose={() => setSheetOpen(false)}>
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{selectedUser?.username ?? "User"}</Text>
              <TouchableOpacity onPress={() => setSheetOpen(false)}>
                <Ionicons name="close" size={50} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 10 }}>
              <Text style={styles.dim}>Telephone</Text>
              <Text style={styles.main}>{selectedUser?.phone_no ?? "—"}</Text>
            </View>
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.dim}>Address</Text>
              <Text style={styles.main}>{selectedUser?.location?.formatted ?? "(i dunno)"}</Text>
            </View>


            {loadingSheet ? (
              <View style={[styles.center, { padding: 20 }]}><ActivityIndicator /></View>
            ) : (
              <FlatList
                data={sharedList}
                keyExtractor={(x) => x.id}
                contentContainerStyle={{ paddingVertical: 6 }}
                ListEmptyComponent={<Text style={{ color: "#666", marginTop: 8 }}>No shared items.</Text>}
                refreshing={listRefreshing}
                onRefresh={refreshSharedList}
                renderItem={({ item }) => {
                  const dl = item.expiryDate ? daysLeft(item.expiryDate) : Infinity;
                  const soon = Number.isFinite(dl) && dl <= 3 && dl >= 0;
                  const expired = isExpired(item.expiryDate);
                  return (
                    <View style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemMeta}>{item.category ?? "Uncategorized"}</Text>
                      </View>
                      <View style={[
                        styles.badge,
                        expired ? styles.badgeExpired : (soon ? styles.badgeSoon : styles.badgeOK)
                      ]}>
                        <Text style={styles.badgeText}>
                          {expired ? "Expired" : (Number.isFinite(dl) ? `${dl}d left` : "No expiry")}
                        </Text>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#fff" },
  center: { justifyContent: "center", alignItems: "center" },
  map: { flex: 1 },

  searchBar: {
    position: "absolute",
    top: 10,
    left: 16,
    right: 16,
    zIndex: 10,
  },

  // floating icon button (bottom-right)
  fab: {
    position: "absolute",
    right: 16,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ffffffb6",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    zIndex: 11,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  legendRow: { flexDirection: "row", alignItems: "center", marginVertical: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { color: "#111827" },

  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.15)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: "70%" },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sheetTitle: { fontSize: 18, fontWeight: "700" },
  dim: { color: "#6B7280", fontSize: 12 },
  main: { color: "#111827", fontSize: 14, marginTop: 2 },
  sectionTitle: { fontWeight: "700", color: "#111827", marginTop: 6 },

  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  itemName: { fontWeight: "700", color: "#111827" },
  itemMeta: { color: "#6B7280", marginTop: 2 },

  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  badgeExpired: { backgroundColor: "#fee2e2" },
  badgeSoon: { backgroundColor: "#ffedd5" },
  badgeOK: { backgroundColor: "#e5f3ff" },
  badgeText: { fontWeight: "700", color: "#1f2937" },
  bottomGroup: {
    position: "absolute",
    left: 16,
    bottom: 20,
    zIndex: 10,
  },
  legend: {
    backgroundColor: "#ffffffc5",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  reloadBtn: {
    marginTop: 8,
    backgroundColor: "#ffffffef",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },


});
