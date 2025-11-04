import React, { useState, useEffect, useContext, useCallback, } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable, TouchableOpacity, Switch, Platform, Alert } from 'react-native';
import { useRouter } from "expo-router";
import { AuthContext } from "../../contexts/AuthContext";
import firebaseApp from "../../config/firebaseConfig";
import { getFirestore, doc, updateDoc, serverTimestamp, } from "firebase/firestore";
import EditCard from "./EditCard";
import { useMessage } from "./Message";

// Imports notifications by Linh
import { useToast } from "../../components/Toast";
import Loading from "@/components/Loading"
import { User, UStats } from "@/types/user"
import { fetchUser, fetchStats, updateUser } from "@/services/userService";
import { sendExpoPush, registerForPushAndSave } from "../(profile2)/utils/pushNotification"

// Initialize Firebase Database
const db = getFirestore(firebaseApp);



// NotificationSettings React Component
export default function NotificationSettings() {
  const router = useRouter();  // Expo router for url jumping
  const { user, authChecked } = useContext(AuthContext);  // Use AuthContext to get user info and logout method
  const USER_ID = user?.uid ?? null;  // Current user ID used for check logged in status
  const [userData, setUserData] = useState<User | null>(null);  // Variable to store user data
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [expiringDays, serExpiringDays] = useState(3);  // Default 3 days
  
  const { showMessage, Message} = useMessage();

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
      // re-fetch user
      const userRes = await fetchUser(USER_ID);

      setUserData(userRes);
      setPushEnabled(Boolean(userRes?.pushEnabled)); // Load cloud push switch setting
      serExpiringDays(userRes?.expiring_days ? userRes.expiring_days : 3);
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
  // Note: The push notification can be delayed, like several minutes.
  const sendPushNoti = async () => {
    if (!userData) return;
    try {
      const token = await registerForPushAndSave(userData.id);
      setPushEnabled(true);
      const { title , body, expiringItems } = await getPushData(); // Prepare notification data
      // Check if the current platform is Android
      if (Platform.OS === "android") {
        Alert.alert(
          "Not abvailable on Expo Go",
          "Note: On Expo Go versions, we can not send you system-level notifications. But we provide a demo test notification."
        );
      } else {
        // Send push notification using Expo
        // Note: The push notification can be delayed, like several minutes.
        await sendExpoPush(token, title, body, { type: "expiring-food-summary", count: expiringItems });
      }
      show("Push enabled", "success");
    } catch (e: any) {
      console.error(e);
      show(`Push error: ${e?.message ?? e}`, "danger");
    } finally {
      setSavingPush(false);
    }
  };

  // Method to prepare notification data
  const getPushData = async () => {
    const stats = await fetchStats(USER_ID);   // Fetch food stats
    const expiringItems = stats.expiringItems; // Calculate expiring items
    const expDays = expiringDays; // Read expring days setting from cloud, default 3 days.

    // Prepare notification content
    const title = "Food expiring soon";
    let body = "";
    if (expiringItems === 0) {
      body = `No items expiring in ≤${expDays} days.`; 
    } else if (expiringItems === 1) {
      body = `You have 1 item expiring in ≤${expDays} days.`;
    } else {
      body = `You have ${expiringItems} items expiring in ≤${expDays} days.`;
    }
    return {title, body, expiringItems };
  }

  // Method to send test notifications
  const sendTestPush = async () => {
    const title = "Food Tracker Go";
    const { body: text } = await getPushData(); // Prepare notification data
    //const message = `${title}\n${text}`
    //show(message, "success");

    showMessage(title, text);
  }

  // Method to show Expo Go note message
  const showExpoGoNote = async () => {
    const note = "Note: On Expo Go versions, we can not send you system-level notifications. But we provide a demo test notification."
    show(note, "success");
  }

  // Method used to update expiring days
  const updateExpringDays = useCallback(async (newDays: number) => {
    if (!userData?.id) {
      throw new Error("User data not loaded");
    }

    const payload = {
      expiring_days: newDays,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(doc(db, "users", userData.id), payload);
    setUserData(prev => (prev ? { ...prev, expiring_days: newDays } : prev));
    serExpiringDays(newDays);
  }, [userData?.id]);

  // Method to handdle edit expring days
  const handdleEditExpiringDays = useCallback(async (newDaysString: string) => {
    const newDays = Number.parseInt(newDaysString.trim(), 10);

    if (Number.isNaN(newDays)) {
      throw new Error("Please input the number of days.");
    }

    if (newDays < 0 || newDays > 380) {
      throw new Error("Please input a suitable number of days.");
    }

    await updateExpringDays(newDays);
    show("Expring Days updated", "success");
  }, [updateExpringDays, show]);

  // Method to display expring days
  const expringDaysString = `${expiringDays} days`;


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
            <Pressable style={({ pressed }) => [ styles.settingItem, pressed && styles.pressed, ]} >
              <View style={[styles.settingItemLined, styles.settingItemLinedFirst ]} >
                <View style={styles.settingItemText}>
                  <Text style={styles.settingItemTitle}>Enable notifications</Text>
                  <Text style={styles.settingItemSubtitle}>Recieve reminders about food expiry</Text>
                </View>
                <Switch
                  value={pushEnabled}
                  onValueChange={onTogglePush}
                  disabled={savingPush || !userData}
                />
              </View>
            </Pressable>
            {/* Note: The push notification can be delayed, like several minutes. */}

            <EditCard
              title="Time to notify"
              subtitle="Notify at this time of a day"
              value="8:00 AM"
              placeholder="8:00 AM"
              message={`Notify at this time of a day. \nNote: In Expo Go versions, we can not send you system-level notifications. But we provide a demo test notification.`}
              disabled={!userData}
              onSubmit={showExpoGoNote} // Show Expo Go note message (same content as above)
              showToast={show}
              inputProps={{ autoCapitalize: "words", maxLength: 32 }}
            />

            {/*<Pressable style={({ pressed }) => [ styles.settingItem, pressed && styles.pressed, ]} onPress={()=>{}} >
              <View style={styles.settingItemLined}>
                <View style={styles.settingItemText}>
                  <Text style={styles.settingItemTitle}>Time to notify</Text>
                  <Text style={styles.settingItemSubtitle}>Notify at this time of a day</Text>
                </View>
                <Text style={styles.settingItemValue}>8:00 AM</Text>
              </View>
            </Pressable>*/}

            <Pressable style={({ pressed }) => [ styles.settingItem, pressed && styles.pressed, ]} >
              <View style={styles.settingItemLined}>
                <View style={styles.settingItemText}>
                  <Text style={styles.settingItemTitle}>Enable sound</Text>
                  <Text style={styles.settingItemSubtitle}>Play sound when sending notifications</Text>
                </View>
                <Switch value={true} onValueChange={() => {}} />
              </View>
            </Pressable>

            <Pressable style={({ pressed }) => [ styles.settingItem, pressed && styles.pressed, ]} >
              <View style={styles.settingItemLined}>
                <View style={styles.settingItemText}>
                  <Text style={styles.settingItemTitle}>Send test notification</Text>
                  <Text style={styles.settingItemSubtitle}>Notify you expiring food items</Text>
                </View>
                <Pressable style={({ pressed }) => [styles.sendButton, pressed && styles.sendButtonPressed]} 
                onPressOut={sendTestPush} >
                  <Text style={styles.sendButtonText}>Send</Text>
                </Pressable>
              </View>
            </Pressable>
          </View>
          
          {/* Expiration Reminder Settings */}
          <Text style={styles.sectionTitle}>Expiration Reminder Settings</Text>
          <View style={styles.section}>
            <EditCard
              title="Notify before expiration"
              subtitle="Days to define expiring food"
              value={expringDaysString}
              placeholder="3 days"
              message="Please input a number. This number is the days to define expiring food."
              disabled={!userData}
              onSubmit={handdleEditExpiringDays}
              showToast={show}
              inputProps={{ autoCapitalize: "words", maxLength: 32 }}
              firstItem
            />
            <Pressable style={({ pressed }) => [ styles.settingItem, pressed && styles.pressed, ]} >
              <View style={styles.settingItemLined}>
                <View style={styles.settingItemText}>
                  <Text style={styles.settingItemTitle}>Show expiring items first</Text>
                  <Text style={styles.settingItemSubtitle}>Default sorting in food list</Text>
                </View>
                <Switch value={true} onValueChange={handleChangeFoodListSorting} />
              </View>
            </Pressable>
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
      <Message />
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
  pressed: {
    backgroundColor: '#f1f2f3',
  },
  section: {
    backgroundColor: 'white',
    marginVertical: 10,
    marginHorizontal: 16,
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
    marginTop: 20,
    marginLeft: 32,
    color: '#333',
  },
  settingItem: {
    paddingLeft: 16,
  },
  
  settingItemLined: {
    paddingVertical: 12,
    paddingRight: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  settingItemLinedFirst: {
    borderTopWidth: 0,
  },
  settingItemPressed: {
    backgroundColor: '#eee',
  },
  settingItemDisabled: {
  },
  settingItemText: {
    flex: 1,
    marginRight: 12,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  settingItemSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#777",
  },
  settingItemValue: {
    fontSize: 16,
    color: "#333",
    maxWidth: "60%",
    textAlign: "right",
  },
  settingItemValueLine: {
    marginTop: 4,
    fontSize: 16,
    color: "#333",
    textAlign: "left",
  },
  sendButton:{
    padding: 10,
    width: 80,
    borderRadius: 12,
    backgroundColor: '#f1f2f3',
    alignItems: 'center',
  },
  sendButtonPressed:{
    backgroundColor: '#cde',
  },
  sendButtonText:{
    fontSize: 14,
    fontWeight: 600,
    color: '#07f',
  },
});
