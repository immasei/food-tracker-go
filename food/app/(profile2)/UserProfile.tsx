// (profile2)/UserProfile.tsx
import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import {
  StyleSheet, Text, View, TouchableOpacity,
  Alert, Switch, ActivityIndicator, FlatList
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { serverTimestamp } from "firebase/firestore";
import { useToast } from "@/components/Toast";
import Loading from "@/components/Loading"
import AddressPicker, { reverseGeocodeWithGoogle, savePickedAddress } from "@/components/AddressPicker";
import { AuthContext } from "@/contexts/AuthContext";
import { User, UStats } from "@/types/user"
import { fetchUser, fetchStats, updateUser } from "@/services/userService";
import { sendExpoPush, registerForPushAndSave } from "./utils/pushNotification";

type PickedAddress = {
  placeId: string;
  formatted: string;
  lat: number;
  lng: number;
  components: any[];
};

type AddressPickerRef = {
  focus: () => void;
  clear: () => void;
};

const UserProfile = () => {
  const { show, Toast } = useToast();
    
  const { user, logout } = useContext(AuthContext);
  const USER_ID = user?.uid ?? null;
  const router = useRouter();

  // --------- pull to refresh --------------
	const [refreshing, setRefreshing] = useState(false);

  // ------initial load --------
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [stats, setStats] = useState<UStats>({ totalItems: 0, expiringItems: 0, expiredItems: 0, sharedItems: 0 });

  // ------ loc ------------
  // when press save address/ use current location btn -> lock btns temporarily to avoid multiple triggers
  const [savingLoc, setSavingLoc] = useState(false);
  // stores the address a user has picked from the autocomplete dropdown
  const [pending, setPending] = useState<PickedAddress | null>(null);
  // when address picker focused , disable scrolling of current view to prevent override on scrolling of dropdown options
  const [pickerOpen, setPickerOpen] = useState(false);

  // ----- address picker ref ----------
  // pickerRef.current?.focus();  // programmatically focus input
  // pickerRef.current?.clear();  // clear text
  const pickerRef = useRef<AddressPickerRef | null>(null);

  // ------- push notifications --------------
  const [pushEnabled, setPushEnabled] = useState(false);
  const [savingPush, setSavingPush] = useState(false);

  // --------- logout -----------
  async function doLogout() {
    await logout();
    router.replace("/login");
  }

	// ------------ pull-to-refresh handler ---------
	const onRefresh = useCallback(async () => {
    if (!USER_ID) {
      show("Please login first.", "danger");
      return;
    }
		setRefreshing(true);
		try {
			// re-fetch both
			const [userRes, statsRes] = await Promise.all([
        fetchUser(USER_ID),
        fetchStats(USER_ID),
      ]);

      setUserData(userRes);
      setStats(statsRes);
      setPushEnabled(Boolean(userRes?.pushEnabled)); // Load cloud push switch setting
		} catch (err) {
      show("ERR: loading user data", "danger");
      console.error("Error refreshing:", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
	}, [USER_ID]);

  // --------- push notification toggle button ---------
  const onTogglePush = async (val: boolean) => {
    if (!USER_ID) {
      show("Please login first.", "danger");
      return;
    }
    setSavingPush(true);
    try {
      if (val) {
        const token = await registerForPushAndSave(USER_ID);
        setPushEnabled(true);

        // compute N and send instant push
        const stats = await fetchStats(USER_ID);

        const title = "Food expiring soon";
        const body = stats.expiringItems === 0 ? "No items expiring in <=3 days" :
                     stats.expiringItems === 1 ? "You have 1 item expiring in <=3 days" :
                                                `You have ${stats.expiringItems} items expiring in ≤3 days`;

        await sendExpoPush(token, title, body, { type: "expiring-food-summary", count: stats.expiredItems });

        show("Push enabled", "success");
      } else {
        await updateUser(USER_ID, { pushEnabled: false });
        setPushEnabled(false);
        show("Push disabled", "warning");
      }
    } catch (e: any) {
      console.error(e);
      show(`Push error: ${e?.message ?? e}`, "danger");
    } finally {
      setSavingPush(false);
    }
  };

  const onSaveAddress = async () => {
    if (!USER_ID) {
      show("Please login first.", "danger");
      return;
    }
    if (!pending) {
      // if no selection yet, focus the picker
      setTimeout(() => pickerRef.current?.focus(), 0);
      return;
    }
    setSavingLoc(true);
    try {
      await savePickedAddress(USER_ID, pending);
      const refreshed = await fetchUser(USER_ID);
      setUserData(refreshed);
      // Alert.alert("Saved", pending.formatted);
      show("Saved: " + pending.formatted, "success");
      setPending(null);                 // clear local selection after save
      pickerRef.current?.clear();
    } catch (e) {
      console.error(e);
      // Alert.alert("Error", "Failed to save address.");
      show("ERR: Failed to save address.")
    } finally {
      setSavingLoc(false);
    }

  };

  // initial load
  useEffect(() => {
    onRefresh();
  }, [onRefresh]);


	// GPS -> reverse geocode -> save (use lat/lng -> send to google place api to get full address)
  async function useCurrentLocation() {
    if (!userData || !USER_ID) return;
    setSavingLoc(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant location permission.");
        setSavingLoc(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude: lat, longitude: lng } = pos.coords;

      const result = await reverseGeocodeWithGoogle(lat, lng);

      if (result) {
        await savePickedAddress(USER_ID, {
          placeId: result.placeId,
          formatted: result.formatted,
          lat,
          lng,
          components: result.components,
        });
				
				// Alert.alert("Saved", result.formatted);
        show("Saved: " + result.formatted, "success");

      } else {
        // fallback: save just coords
        await updateUser(USER_ID, {
          location: {
            ...(userData.location ?? {}),
            lat, lng,
            updatedAt: serverTimestamp(),
          },
        });
				// Alert.alert("Coordinated saved", ":D");
        show("Lat/lon saved.", "warning")
      }

      const refreshed = await fetchUser(USER_ID);
      setUserData(refreshed);
			// Alert.alert("Saved", "Current location saved.");
    } catch (e) {
      console.error(e);
      // Alert.alert("Error", "Failed to get/save current location.");
      show("ERR: Failed to save current location", "danger")
    } finally {
      setSavingLoc(false);
    }
  }

  if (loading || !USER_ID) {
    return (
      <View style={styles.container}>
        <Loading/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        renderItem={() => null}          
        keyExtractor={() => "header"}
        ListHeaderComponent={
          <>
            {/* profile */}
            <View style={styles.profileSection}>
              <Text style={styles.username}>{userData?.username || "Unknown"}</Text>
              <Text style={styles.userDetail}>Email: {userData?.email || "—"}</Text>
              <Text style={styles.userDetail}>Mobile: {userData?.phone_no || "—"}</Text>

              <TouchableOpacity
                style={styles.settingsButton}
                onPress={doLogout}
              >
                <Ionicons name="log-out-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* location */}
            <View style={styles.locationContainer}>
              <Text style={[styles.statsTitle, { paddingLeft: 0 }]}>Location</Text>
              <Text style={{ color: "#666", marginBottom: 12 }}>
                Pick your address (AU) or use current GPS.
              </Text>

              <View style={{ marginTop: 0, overflow: "visible" }}>
                <AddressPicker
                  ref={pickerRef}
                  onPicked={(picked) => {
                    setPending(picked);
                    // no DB writes here
                  }}
                  onOpenChange={(open) => setPickerOpen(open)}   
                />
              </View>

              {/* btn row: left = use selected address, right = use current GPS */}
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.saveBtn, styles.btnPrimary]}
                  onPress={onSaveAddress}
                  disabled={savingLoc || !userData}
                >
                  {savingLoc ? (
                    <ActivityIndicator size="small" color="#fff"/>
                  ) : (
                    <Text style={styles.saveBtnText}>Save address</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, styles.btnSuccess]}
                  onPress={useCurrentLocation}
                  disabled={savingLoc || !userData}
                >
                  {savingLoc ? (
                    <ActivityIndicator size="small" color="#fff"/>
                  ) : (
                    <Text style={styles.saveBtnText}>Use current</Text>
                  )}
                </TouchableOpacity>
              </View>

              {userData?.location && (
                // see map icon button
                <View style={styles.savedCard}>
                  <View style={styles.savedHeader}>
                    <Text style={{ color: "#333", fontWeight: "700" }}>Saved:</Text>
                    <TouchableOpacity
                      style={styles.mapIconInline}
                      disabled={savingLoc || !userData}
                      onPress={() => {
                        router.push({
                          pathname: "/Map",
                          params: {
                            lat: userData?.location?.lat,
                            lng: userData?.location?.lng,
                            formatted: userData?.location?.formatted,
                          },
                        });
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        {savingLoc ? (
                          <ActivityIndicator size="small" color="#2563EB"/>
                        ) : (
                          <>
                          <Text style={{ color: "#2563EB", fontSize: 11, fontWeight: 500 }}>Open Map</Text>
                          <Ionicons name="map-outline" size={17} color="#2563EB" />
                          </>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>

                  <Text style={{ color: "#666", flexShrink: 1 }}>
                    {userData.location.formatted || "—"}
                  </Text>
                  <Text></Text>
                  <Text style={{ color: "#666" }}>
                    Lat/Lng: {userData.location.lat ?? "—"}, {userData.location.lng ?? "—"}
                  </Text>
                  <Text style={{ color: "#666" }}>
                    Suburb/State/Postcode: {userData.location.suburb || "—"}{" "}
                    {userData.location.state || "—"} {userData.location.postcode || ""}
                  </Text>
                  <Text style={{ color: "#666" }}>
                    Country: {userData.location.country || "—"}
                  </Text>
                </View>
              )}

              {!userData?.location && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ color: "#333", fontWeight: "700" }}>Saved:</Text>
                  <Text style={{ color: "#666" }}>(No address yet)</Text>
                  <Text></Text>
                  <Text style={{ color: "#666" }}>
                    Lat/Lng: {"—"}
                  </Text>
                  <Text style={{ color: "#666" }}>
                    Suburb/State/Postcode: {"—"}
                  </Text>
                  <Text style={{ color: "#666" }}>
                    Country: {"—"}
                  </Text>
                </View>
              )}
            </View>

            {/* stats */}
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Food tracking statistics</Text>
              <View style={styles.statsGrid}>
                <StatCard title="Total" value={stats.totalItems} icon="fast-food-outline" />
                <StatCard title="Expiring" value={stats.expiringItems} icon="timer-outline" />
                <StatCard title="Expired" value={stats.expiredItems} icon="warning-outline" />
                <StatCard title="Shared" value={stats.sharedItems} icon="people-outline" />
              </View>
            </View>

            {/* settings */}
            <View style={styles.settingsContainer}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Ionicons name="notifications-outline" size={22} color="#333" />
                  <Text style={{ fontSize: 16, color: "#333", fontWeight: "600" }}>Enable notifications</Text>
                </View>
                <Switch
                  value={pushEnabled}
                  onValueChange={onTogglePush}
                  disabled={savingPush || !userData}
                />
              </View>
              <Text style={{ color: "#666", marginTop: 6 }}>
                Receive reminders and updates.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.logoutBtn, styles.btnDanger]}
              onPress={doLogout}
            >
              <Text style={styles.btnText}>Log Out</Text>
            </TouchableOpacity>
          </>
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEnabled={!pickerOpen}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      <Toast/>
    </View>
  );

  
};

const StatCard = ({ title, value, icon }: { title: string; value: number; icon: string }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon as any} size={24} color="#2196F3" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

export default UserProfile;

// --- styles ---
const styles = StyleSheet.create({
  btnDanger: { backgroundColor: "#EF4444", paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  btnGrey: { backgroundColor: "#666666"},
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollView: { flex: 1 },
  bottomPadding: { height: 30 },

  settingsButton: { position: "absolute", top: 20, right: 20, zIndex: 1, padding: 2 },
  profileSection: {
    paddingTop: 20, paddingBottom: 0, marginTop: 0, marginHorizontal: 20,
    alignItems: "center", borderRadius: 20
  },
  username: { fontSize: 24, fontWeight: "bold", marginBottom: 5, color: "#333" },
  userDetail: { fontSize: 16, color: "#666", marginBottom: 10 },

  statsContainer: { padding: 20, marginTop: 0, paddingBottom: 2 },
  statsTitle: { fontSize: 18, fontWeight: "600", marginBottom: 13, color: "#333", paddingLeft: 10 },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "nowrap",
    gap: 8,
  },
  statCard: {
    flex: 1,
    maxWidth: "23%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#07e861ff",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 2.22,
    elevation: 3,
  },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#07f", marginVertical: 5 },
  statTitle: { fontSize: 14, color: "#666" },
  settingsContainer: {
    marginHorizontal: 10,
    borderRadius: 20,
    marginTop:0,
    padding: 20,
    overflow: 'visible',
  },

  locationContainer: {
    backgroundColor: '#ffffffec',
    marginHorizontal: 20,
    borderRadius: 20,
    marginTop:15,
    padding: 20,
    overflow: 'visible',
  },
  settingsButtom: { flexDirection: "row", alignItems: "center", gap: 10, width: "100%" },
  settingsText: { fontSize: 18, color: "#333" },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#111827",
  },
  row: { flexDirection: "row", gap: 8, marginTop:5 },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutBtn: {
    paddingVertical: 50,
    borderRadius: 14,
    marginHorizontal: 20,
  },
  btnPrimary: { backgroundColor: "#2563EB" },
  btnSuccess: { backgroundColor: "#059669" },
  saveBtnText: { color: "#fff", fontWeight: "700" },
  iconBtn: {
    width: 48,
    height: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mapIconFloating: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 6,
  },
  savedCard: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 1,
  },
  savedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  mapIconInline: {
    padding: 7,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
  },

});
