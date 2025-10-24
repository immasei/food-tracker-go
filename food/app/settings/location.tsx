import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from "expo-router";

import { AuthContext } from "../../contexts/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import { serverTimestamp } from "firebase/firestore";

// Imports for location by Linh
import * as Location from "expo-location";
import AddressPicker, { reverseGeocodeWithGoogle, savePickedAddress } from "@/components/AddressPicker";
import { useToast } from "../../components/Toast";
import Loading from "@/components/Loading"
import { User } from "@/types/user"
import { fetchUser, fetchStats, updateUser } from "@/services/userService";



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
  const { user, authChecked } = useContext(AuthContext);     // Use AuthContext to get user info and logout method
  const USER_ID = user?.uid ?? null;  // Current user ID used for check logged in status
  const [userData, setUserData] = useState<User | null>(null);   // Variable to store user data
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);



  // Location by Linh
  const { show, Toast } = useToast(); // Toast for in-app
  // savingLoc: When press save address/ use current location btn -> lock btns temporarily to avoid multiple triggers
  const [savingLoc, setSavingLoc] = useState(false);
  // pending: Stores the address a user has picked from the autocomplete dropdown
  const [pending, setPending] = useState<PickedAddress | null>(null);
  // pickerOpen: When address picker focused , disable scrolling of current view to prevent override on scrolling of dropdown options
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<AddressPickerRef | null>(null);  // address picker ref
  


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



  // Method to get current location using GPS by Linh
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
        </> }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEnabled={!pickerOpen}
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
    zIndex: 2,
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
