import React, { useState, useEffect, useContext, useCallback, } from 'react';
import { View, Text, StyleSheet, Switch, FlatList, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter } from "expo-router";
import { AuthContext } from "../../contexts/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseApp from "../../config/firebaseConfig";
import { getFirestore, doc, getDoc, updateDoc, getDocs, collection, query, where } from "firebase/firestore";

// Imports notifications by Linh
import { useToast } from "../../components/Toast";
import Loading from "@/components/Loading"
import { User, UStats } from "@/types/user"
import { fetchUser, fetchStats, updateUser } from "@/services/userService";
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
  const router = useRouter();  // Expo router for url jumping
  const { user, authChecked } = useContext(AuthContext);     // Use AuthContext to get user info and logout method
  const USER_ID = user?.uid ?? null;  // Current user ID used for check logged in status
  const [userData, setUserData] = useState<User | null>(null);   // Variable to store user data
  const [stats, setStats] = useState<UStats>({ totalItems: 0, expiringItems: 0, expiredItems: 0, sharedItems: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Push notification by Linh
  const { show, Toast } = useToast(); // Toast for in-app
  // savingPush: Disable push toggle button when button is switching
  const [savingPush, setSavingPush] = useState(false);



  // Method to fetch user data
  // Used in pull-to-refresh handler by Linh
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
  
  // Auto start
  useEffect(() => {
    onRefresh();
    }, [onRefresh]);



  // Method to handle change of food list sorting toggle
  const handleChangeFoodListSorting = (value: boolean) => {
    if (!value) {
      handleChangeFoodListSorting(true);  // Force enable
    }
  };

  // Method to handle toggle push notification button by Linh
  const onTogglePush = async (val: boolean) => {
    if (!USER_ID) {
      show("Please login first.", "danger");
      return;
    }
    // Check if the current platform is Android
    /*if (Platform.OS === "android") {
      Alert.alert(
        "Not available on Android",
        "Push notifications are not supported or disabled for Android devices yet."
      );
      return;
    }*/
    /* This check is useless, because the error message occurs at the time 
       just opening the app, at the login page, not when toggling notifacation button.
       On Android phone, user can see the toast for toggling the button. There are no error about toggling the button.
       If we keep the library imported, the error message will show up when opening the app.
       So the solution is opening the app in advance, or not using Android phone, so this error message will not be seen.
    */
    setSavingPush(true);
    if (val) {  // Toggle on
      // Send one push notification now when toggled on
      await sendPushNoti();
    } else {  // Toggle off
      // Save setting to DB
      await updateUser(USER_ID, { pushEnabled: false });
      setPushEnabled(false);  // Manually update user data after push setting is saved
      show("Push disabled", "warning");
    }
    setSavingPush(false);
  };

  // Method to send push notification by Linh
  const sendPushNoti = async () => {
    if (!userData) return;
    try {
      const token = await registerForPushAndSave(userData.id);
      setPushEnabled(true);
      const stats = await fetchStats(USER_ID);   // Fetch food stats
      const expiringItems = stats.expiringItems; // Calculate expiring items
      const expDays = user.expring_days ? user.expring_days : 3; // Read expring days setting from cloud, default 3 days.

      // Prepare notification content
      const title = "Food expiring soon";
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

  if (loading || !USER_ID) {
    return (
      <View style={styles.container}>
        <Loading/>
      </View>
    );
  }



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
                value={pushEnabled}
                onValueChange={onTogglePush}
                disabled={savingPush || !userData}
              />
            </View>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={()=>{}}
            >
              <Text style={styles.settingLabel}>Time to notify</Text>
              <Text style={styles.timeText}> 8:00 AM </Text>
            </TouchableOpacity>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Enable sound</Text>
              <Switch
                value={true}
                onValueChange={() => {}}
              />
            </View>
          </View>
          
          {/* Expiration Reminder Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expiration Reminder Settings</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>
                Notify before expiration: {3} days
              </Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Show expiring items first</Text>
              <Switch
                value={true}
                onValueChange={handleChangeFoodListSorting}
              />
            </View>
          </View>
        </> }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
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
