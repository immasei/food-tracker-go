import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, PermissionsAndroid, Platform,TouchableOpacity, Text } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import AddressPicker, { reverseGeocodeWithGoogle, AddressPickerRef } from "./AddressPicker";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function MapScreen() {
  const [region, setRegion] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const pickerRef = useRef<AddressPickerRef>(null);

  const router = useRouter();

  // data sent from the UserProfile through the router
  const { lat, lng, formatted } = useLocalSearchParams();

  // add marker to the saved/current location
  useEffect(() => {
    if (!lat || !lng) {
      return;
    }

    const userLat = Number(lat);
    const userLong = Number(lng);

    // set the map region centered on the saved address
    setRegion({
      latitude: userLat,
      longitude: userLong,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    // add marker for the saved/current location
    setMarkers([
      {
        id: "saved",
        title: formatted ?? "Saved address",
        coordinate: {
          latitude: userLat,
          longitude: userLong,
        },
      },
    ]);
  }, []);

  // user picking a place
  const handlePicked = (picked: any) => {
    setMarkers((prev) => [
      ...prev,
      {
        id: picked.placeId,
        title: picked.formatted,
        coordinate: { latitude: picked.lat, longitude: picked.lng },
      },
    ]);

    setRegion({
      latitude: picked.lat,
      longitude: picked.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  if (!region) return null;

  return (
    <View style={styles.container}>
      {/* map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
      >
        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={m.coordinate}
            title={m.title}
          />
        ))}
      </MapView>

      <TouchableOpacity style={styles.backbtn} onPress={() => router.back()}>
        <Text style={styles.backbtnText}>Back</Text>
      </TouchableOpacity>

      {/* pick address while using the map */}
      {/* <View style={styles.searchBox}>
        <AddressPicker ref={pickerRef} onPicked={handlePicked} />
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  map: { 
    flex: 1 
  },
  searchBox: {
    position: "absolute",
    top: 60,
    left: 10,
    right: 10,
  },
  backbtn: {
    position: "absolute",
    top: 50,
    left: 15,
    backgroundColor: "#2563EB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12
  },
  backbtnText: {
    color: "#fff",
    fontWeight: "600"
  }
});
