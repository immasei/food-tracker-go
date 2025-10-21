import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, RefreshControl,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { daysLeft, isExpired } from "../(tracker)/utils/dates"; 
import firebaseApp from "../../config/firebaseConfig";
import {
  getFirestore, collection, getDocs, query, where,
  updateDoc, doc, serverTimestamp, getDoc
} from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContext";
import AddressPicker, { reverseGeocodeWithGoogle } from "./AddressPicker";
import { savePickedAddress } from "./firebase";
import { Switch } from "react-native"; 
import { useToast } from "../../components/Toast";
import { sendExpoPush, registerForPushAndSave } from "./PushNotification"
import MapScreen from "./Map";

// --- firebase ---
const db = getFirestore(firebaseApp);

type Stats = {
  totalItems: number;
  expiringItems: number;
  expiredItems: number;
  sharedItems: number;
};

type Location = {
  placeId?: string | null;
  formatted?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
  country?: string | null;
  lat?: number | null;
  lng?: number | null;
  updatedAt?: any;
};

type UserData = {
  id: string;
  userid: string;
  username?: string | null;
  email?: string | null;
  phone_no?: string | null;
  location?: Location | null;
  pushEnabled?: boolean; 
};

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

const User = () => {
  const { show, Toast } = useToast();
    
  const { user, logout } = useContext(AuthContext);
  const USER_ID = user.uid;
  const router = useRouter();

  // --------- pull to refresh --------------
	const [refreshing, setRefreshing] = useState(false);

  // ------initial load --------
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState<Stats>({ totalItems: 0, expiringItems: 0, expiredItems: 0, sharedItems: 0 });

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

  // --------- fetch the current user info --------
  async function fetchUser() {
		const ref = doc(db, "users", USER_ID);
		const snap = await getDoc(ref);
		if (snap.exists()) {
			const userData = snap.data();
			const loc = (userData.location ?? null) as Location | null;

			setUserData({
				id: snap.id,
				userid: userData.userid ?? USER_ID,
				username: userData.username ?? null,
				email: userData.email ?? null,
				phone_no: userData.phone_no ?? null,
				location: loc,
        pushEnabled: Boolean(userData.pushEnabled),
			});
      setPushEnabled(Boolean(userData.pushEnabled));
		}
  }

  // -------- fetch food stats for this user -----------
	async function fetchStats() {
		const qFood = query(collection(db, "food"), where("userId", "==", USER_ID));
		const snap = await getDocs(qFood);

		let total = 0;
		let expiring = 0;
		let expired = 0;
    let shared = 0;

		snap.forEach((d) => {
      // num total
			const x = d.data() as any;
			total += 1;

      // num shared
      if (x.shared === true) shared += 1;

      // expired and soon expiring (d<=3)
			const ymd = x.expiryDate ?? null;
			if (isExpired(ymd)) {
				expired += 1;
			} else {
				const dl = daysLeft(ymd);
				if (Number.isFinite(dl) && dl <= 3) expiring += 1;
			}
		});

		setStats({
			totalItems: total,
			expiringItems: expiring,
			expiredItems: expired,
			sharedItems: shared,
		});
	}

	// ------------ pull-to-refresh handler ---------
	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			// re-fetch both
			await Promise.all([fetchUser(), fetchStats()]);
		} finally {
			setRefreshing(false);
		}
	}, [fetchUser, fetchStats]);

  const onTogglePush = async (val: boolean) => {
    if (!userData) return;
    setSavingPush(true);
    try {
      if (val) {
        const token = await registerForPushAndSave(userData.id);
        setPushEnabled(true);

        // compute N and send instant push
        await fetchStats();
        const title = "Food expiring soon";
        const body = stats.expiringItems === 0 ? "No items expiring in <=3 days" :
                     stats.expiringItems === 1 ? "You have 1 item expiring in <=3 days" :
                                                `You have ${stats.expiringItems} items expiring in ≤3 days`;

        await sendExpoPush(token, title, body, { type: "expiring-food-summary", count: stats.expiredItems });

        show("Push enabled", "success");
      } else {
        await updateDoc(doc(db, "users", userData.id), { pushEnabled: false });
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


  // initial load
  useEffect(() => {
    (async () => {
      try {
        await fetchUser();
        await fetchStats();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

	// GPS -> reverse geocode -> save (use lat/lng -> send to google place api to get full address)
  async function useCurrentLocation() {
    if (!userData) return;
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
        await savePickedAddress(userData.id, {
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
        await updateDoc(doc(db, "users", userData.id), {
          location: {
            ...(userData.location ?? {}),
            lat, lng,
            updatedAt: serverTimestamp(),
          },
        });
				// Alert.alert("Coordinated saved", ":D");
        show("Lat/lon saved.", "warning")
      }

      const refreshed = await getDoc(doc(db, "users", userData.id));
      setUserData(u => (u ? { ...u, location: (refreshed.data() as any).location ?? null } : u));
			// Alert.alert("Saved", "Current location saved.");
    } catch (e) {
      console.error(e);
      // Alert.alert("Error", "Failed to get/save current location.");
      show("ERR: Failed to save current location", "danger")
    } finally {
      setSavingLoc(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEnabled={!pickerOpen}
        keyboardDismissMode={Platform.OS === "ios" ? "on-drag" : "none"}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* profile */}
        <View style={styles.profileSection}>
          <Text style={styles.username}>{userData?.username || "Unknown"}</Text>
          <Text style={styles.userDetail}>Email: {userData?.email || "—"}</Text>
          <Text style={styles.userDetail}>Mobile: {userData?.phone_no || "—"}</Text>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => show(`Hello ${userData?.username ?? ""}!`, "success")}
          >
            <Ionicons name="person-outline" size={24} color="#333" />
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
              onPress={async () => {
                if (!userData) return;
                if (!pending) {
                  // if no selection yet, focus the picker
                  setTimeout(() => pickerRef.current?.focus(), 0);
                  return;
                }
                setSavingLoc(true);
                try {
                  await savePickedAddress(userData.id, pending);
                  const refreshed = await getDoc(doc(db, "users", userData.id));
                  setUserData(u => (u ? { ...u, location: (refreshed.data() as any).location ?? null } : u));
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
              }}
              disabled={savingLoc || !userData}
            >
              <Text style={styles.saveBtnText}>Save address</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, styles.btnSuccess]}
              onPress={useCurrentLocation}
              disabled={savingLoc || !userData}
            >
              <Text style={styles.saveBtnText}>{savingLoc ? "…" : "Use current"}</Text>
            </TouchableOpacity>
          </View>

          <View>
            {/* display map */}
            <TouchableOpacity
              style={[styles.saveBtn]}
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
              disabled={!userData?.location}
            >
              <Text>View on map</Text>
            </TouchableOpacity>
          </View>

          {userData?.location && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: "#333", fontWeight: "700" }}>Saved:</Text>
              <Text style={{ color: "#666" }}>{userData.location.formatted || "—"}</Text>
              <Text></Text>
              <Text style={{ color: "#666" }}>
                Lat/Lng: {userData.location.lat ?? "—"}, {userData.location.lng ?? "—"}
              </Text>
              <Text style={{ color: "#666" }}>
                Suburb/State/Postcode: {userData.location.suburb || "—"} {userData.location.state || "—"} {userData.location.postcode || ""}
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
      </ScrollView>
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

export default User;

// --- styles ---
const styles = StyleSheet.create({
  btnDanger: { backgroundColor: "#EF4444", paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollView: { flex: 1 },
  bottomPadding: { height: 30 },

  settingsButton: { position: "absolute", top: 20, right: 20, zIndex: 1, padding: 8 },
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
    backgroundColor: '#fff',
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
    borderRadius: 12,
    marginHorizontal: 20,


  },
  btnPrimary: { backgroundColor: "#2563EB" },
  btnSuccess: { backgroundColor: "#059669" },
  saveBtnText: { color: "#fff", fontWeight: "700" },
});
