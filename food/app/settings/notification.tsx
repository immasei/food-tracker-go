import React, { useState, useEffect, useContext, useCallback, } from 'react';
import { View, Text, StyleSheet, Switch, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from "expo-router";
import { AuthContext } from "../../contexts/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseApp from "../../config/firebaseConfig";
import { getFirestore, doc, getDoc, updateDoc, getDocs, collection, query, where } from "firebase/firestore";

// Imports for location and notifications by Linh
import * as Location from "expo-location";
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



// NotificationSettings React Component
export default function NotificationSettings() {
  const { user, authChecked } = useContext(AuthContext);     // Use AuthContext to get user info and logout method
  const [userData, setUserData] = useState<UserData | null>(null);   // Variable to store user data
  const [loading, setLoading] = useState(false);

  // Used for notification content
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
          {/* Notification Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Settings</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Enable notifications</Text>
              <Switch
                value={userData?.pushEnabled}
                onValueChange={onTogglePush}
                disabled={savingPush || !userData}
              />
            </View>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={()=>{}}
            >
              <Text style={styles.settingLabel}>Time to notify</Text>
              <Text style={styles.timeText}>
                {settings.notifyTime.toLocaleTimeString().slice(0, 5)}
              </Text>
            </TouchableOpacity>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Enable sound</Text>
              <Switch
                value={settings.enableSound}
                onValueChange={(value) => handleSettingChange('enableSound', value)}
              />
            </View>
          </View>
          
          {/* Expiration Reminder Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expiration Reminder Settings</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>
                Notify before expiration: {settings.expirationThreshold} days
              </Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Show expiring items first</Text>
              <Switch
                value={settings.showExpiringFirst}
                onValueChange={handleChangeFoodListSorting}
              />
            </View>
          </View>
        </> }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
    paddingTop: 10,
  },
  infoCardGroup: {
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    marginVertical: 10,
    marginHorizontal: 16,
    paddingTop: 12,
    borderWidth: 0,
    borderColor: '#eee',
    borderRadius: 20,
    shadowColor: "#bbb",
    shadowRadius: 5,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 16,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
    marginLeft: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  settingItemPressed: {
    backgroundColor: '#f1f2f3',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  timeText: {
    fontSize: 16,
    color: '#666',
  },
  sliderThumb: {
    backgroundColor: '#2196F3',
    width: 24,
    height: 24,
  },
  sliderTrack: {
    height: 4,
  },
  logoutButton: {
    marginVertical: 40,
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#fdd",
    shadowColor: "#fdd",
    shadowRadius: 5,
    elevation: 5,
  },
  logoutText: {
    color: "#f00",
    fontWeight: "600",
    fontSize: 16,
  },




  // Styles for location and notification by Linh
  btnDanger: { backgroundColor: "#EF4444", paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
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
    marginHorizontal: 16,
    borderRadius: 20,
    marginTop:15,
    padding: 20,
    overflow: 'visible',
    shadowColor: "#bbb",
    shadowRadius: 5,
    elevation: 5,
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
  mapBtn: {
    flex: 1,
    backgroundColor: "#666666",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    marginTop: 7
  },
  mapBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
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
