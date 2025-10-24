import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from "expo-router";

import { AuthContext } from "../../contexts/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import firebaseApp from "../../config/firebaseConfig";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, getDocs, collection, query, where } from "firebase/firestore";

// Imports for location and notifications by Linh
import * as Location from "expo-location";
import AddressPicker, { reverseGeocodeWithGoogle, savePickedAddress } from "@/components/AddressPicker";
import { useToast } from "../../components/Toast";
import { sendExpoPush, registerForPushAndSave } from "../(profile2)/utils/pushNotification"



// Interface for settings data
interface SettingsState {
  notifyTime: Date;
  expirationThreshold: number; // Expiring window in days
  enableSound: boolean;
  showExpiringFirst: boolean;
}

// Initialize Firebase Database
const db = getFirestore(firebaseApp);

// Data type definition for user data
type UserData = {
  id: string;
  username: string;
  email: string;
  phone_no: string;
  taste_pref: string;
  allergy_info: string;
  location: Location;
  pushEnabled: boolean;
};

// Data type definition for location
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

// Data type definition for picked address
type PickedAddress = {
  placeId: string;
  formatted: string;
  lat: number;
  lng: number;
  components: any[];
};

// Ref type definition for AddressPicker
type AddressPickerRef = {
  focus: () => void;
  clear: () => void;
};



// Settings React Component
export default function Settings() {
  const router = useRouter();  // Expo router for url jumping
  const { user, logout, authChecked } = useContext(AuthContext);     // Use AuthContext to get user info and logout method
  const USER_ID = user?.uid ?? null;  // Current user ID used for check logged in status
  const [userData, setUserData] = useState<UserData | null>(null);   // Variable to store user data
  const [loading, setLoading] = useState(false);

  // Used for notifications
  const [expiringItems, setExpiringItems] = useState(0);
  const [expiredItems, setExpiredItems] = useState(0);


  // Variable to store settings data
  const [settings, setSettings] = useState<SettingsState>({
    notifyTime: new Date(),
    expirationThreshold: 3,
    enableSound: true,
    showExpiringFirst: true,
  });



  // Location & push notification by Linh
  const { show, Toast } = useToast(); // Toast for in-app
  // savingLoc: When press save address/ use current location btn -> lock btns temporarily to avoid multiple triggers
  const [savingLoc, setSavingLoc] = useState(false);
  // pending: Stores the address a user has picked from the autocomplete dropdown
  const [pending, setPending] = useState<PickedAddress | null>(null);
  // pickerOpen: When address picker focused , disable scrolling of current view to prevent override on scrolling of dropdown options
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<AddressPickerRef | null>(null);  // address picker ref
  // savingPush: Disable push toggle button when button is switching
  const [savingPush, setSavingPush] = useState(false);
  


  // Auto start 1：Load settings
  useEffect(() => {
    loadSettings();
  }, []);

  // Method to load settings data from async storage
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({
          ...parsedSettings,
          notifyTime: new Date(parsedSettings.dailyReminderTime),
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Method to save settings data to async storage
  const saveSettings = async (newSettings: SettingsState) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Method to change the settings data variable
  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Conditional auto-start 2: Fetch user data
  useEffect(() => {
    // Check if user is logged in
    if (!authChecked) return; // If auth state is not checked, skip the code.
    if (!user?.uid) {     // If no user is logged in
      setUserData(null);  // Reset user data variable
      return;
    }

    fetchUserData();

  }, [authChecked, user?.uid]); // Re-run when authCheck state or user ID changes

  // Method to fetch user data from Firebase
  const fetchUserData = async () => {
    try {
      const snapshot1 = await getDoc(doc(db, "users", user.uid));
      if (snapshot1.exists()) {
        const data = snapshot1.data() as Partial<UserData>;
        const tastePref = typeof data.taste_pref === "string" ? data.taste_pref : "";
        const allergyInfo = typeof data.allergy_info === "string" ? data.allergy_info : "";
        const location = typeof data.location === "object" ? data.location : { formatted: "" };

        setUserData({
          id: snapshot1.id,
          username: data.username ?? "",
          email: data.email ?? "",
          phone_no: data.phone_no ?? "",
          taste_pref: tastePref,
          allergy_info: allergyInfo,
          location: location,
          pushEnabled: data.pushEnabled ?? false,
        });
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  
  // Method to fetch food list from Firebase and calculate expiring/expired items
  const fetchFoodList = async () => {
    try {
      const foodQuery = query(collection(db, "food"), where("userId", "==", user.uid));
      const snapshot2 = await getDocs(foodQuery);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const soon = new Date(today);
      soon.setDate(today.getDate() + settings.expirationThreshold);

      // Function to parse expiry date from various formats
      const parseExpiryDate = (value: unknown): Date | null => {
        if (typeof value === "string" && value.trim().length > 0) {
          const dt = new Date(value);
          return Number.isNaN(dt.getTime()) ? null : dt;
        }
        if (value && typeof value === "object" && typeof (value as any).toDate === "function") {
          const dt = (value as any).toDate();
          return dt instanceof Date && !Number.isNaN(dt.getTime()) ? dt : null;
        }
        return null;
      };

      // Loop through each food item to calculate expiry stats
      snapshot2.forEach((docSnap) => {
        const data = docSnap.data() ?? {};

        // Check expiry status and count expiring & expired items
        const expiry = parseExpiryDate((data as any).expiryDate);
        if (expiry) {
          if (expiry < today) {
            setExpiredItems((prev) => prev + 1);
          } else if (expiry <= soon) {
            setExpiringItems((prev) => prev + 1);
          }
        }
      });

    } catch (error) {
      console.error("Error fetching food stats:", error);
    }
  };

  // Method to handle change of food list sorting toggle
  const handleChangeFoodListSorting = (value: boolean) => {
    if (!value) {
      handleChangeFoodListSorting(true);  // Force enable
    }
  };



  // Method to get current location using GPS by Linh
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

  // Method to save picked address from autocomplete dropdown by Linh
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
      //const refreshed = 
      await fetchUserData();
      //setUserData(refreshed);
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

  // Method to handle toggle push notification button by Linh
  const onTogglePush = async (val: boolean) => {
    if (!userData) return;
    setSavingPush(true);
    if (val) {  // Toggle on
      // Send one push notification now when toggled on
      await sendPushNoti();
    } else {  // Toggle off
      // Save setting to DB
      await updateDoc(doc(db, "users", userData.id), { pushEnabled: false });
      fetchUserData();  // Manually update user data after push setting is saved
      show("Push disabled", "warning");
    }
    setSavingPush(false);
  };

  // Method to send push notification by Linh
  const sendPushNoti = async () => {
    if (!userData) return;
    try {
      const token = await registerForPushAndSave(userData.id);
      await fetchUserData();  // Fetch user data after registering for push
      await fetchFoodList(); // Fetch food stats when used to send push

      // Prepare notification content
      const title = "Food expiring soon";
      const expDays = settings.expirationThreshold;
      let body = "";
      if (expiringItems > 0) {
        body = `No items expiring in <=${expDays} days`; 
      } else if (expiringItems === 1) {
        body = `You have 1 item expiring in <=${expDays} days`;
      } else {
        body = `You have ${expiringItems} items expiring in <=${expDays} days`;
      }
      
      // Send push notification using Expo
      await sendExpoPush(token, title, body, { type: "expiring-food-summary", count: expiringItems });

      show("Push enabled", "success");
      
    } catch (e: any) {
      console.error(e);
      show(`Push error: ${e?.message ?? e}`, "danger");
    } finally {
      setSavingPush(false);
    }
  };

  // Pull-to-refresh handler by Linh
  const onRefresh = useCallback(async () => {
    setLoading(true);
    try {
      // Re-fetch both user data and food stats
      await Promise.all([fetchUserData(), fetchFoodList()]);
    } finally {
      setLoading(false);
    }
  }, [fetchUserData, fetchFoodList]);



  return (
    <View style={styles.container}>
      {/*<ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false} // Hide vertical scroll indicator
        keyboardShouldPersistTaps="handled"  // Dismiss keyboard on tap outside
        keyboardDismissMode={Platform.OS === "ios" ? "on-drag" : "none"} // iOS: drag to dismiss keyboard
        nestedScrollEnabled
        scrollEnabled={!pickerOpen} // Disable scrolling when picker is open
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
      >*/}
      <FlatList data={[]} renderItem={() => null} keyExtractor={() => "header"} 
      style={styles.scrollView} ListHeaderComponent={
        <>
          {/* Location settings by Linh */}
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
                  <ActivityIndicator size="small" color="#fff" />
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
                  <ActivityIndicator size="small" color="#fff" />
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
                        <ActivityIndicator size="small" color="#2563EB" />
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

          {/* Notification settings by Linh */}
          <View style={styles.settingsContainer}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="notifications-outline" size={22} color="#333" />
                <Text style={{ fontSize: 16, color: "#333", fontWeight: "600" }}>Enable notifications</Text>
              </View>
              <Switch
                value={userData?.pushEnabled}
                onValueChange={onTogglePush}
                disabled={savingPush || !userData}
              />
            </View>
            <Text style={{ color: "#666", marginTop: 6 }}>
              Receive reminders and updates.
            </Text>
          </View>
        </> }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEnabled={!pickerOpen}
        refreshing={loading}
        onRefresh={onRefresh}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      {/*</ScrollView>*/}
      <Toast />
    </View>
  );
}



// Style sheets
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f2f3',
  },
  scrollView: {
    flex: 1,
    paddingTop: 26,
  },



  // Styles for location and notification by Linh
  statsTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginBottom: 13, 
    color: "#333", 
    paddingLeft: 10 
  },
  settingsContainer: {
    marginHorizontal: 10,
    borderRadius: 20,
    marginTop:0,
    padding: 20,
    overflow: 'visible',
  },
  locationContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 20,
    marginTop:15,
    padding: 20,
    overflow: 'visible',
    shadowColor: "#bbb",
    shadowRadius: 5,
    elevation: 5,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#111827",
  },
  row: { 
    flexDirection: "row", 
    gap: 8, 
    marginTop:5 
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnPrimary: { 
    backgroundColor: "#2563EB" 
  },
  btnSuccess: { 
    backgroundColor: "#059669" 
  },
  saveBtnText: { 
    color: "#fff", 
    fontWeight: "700" 
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
