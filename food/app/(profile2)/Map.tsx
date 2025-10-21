import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, PermissionsAndroid, Platform,TouchableOpacity, Text } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import AddressPicker, { reverseGeocodeWithGoogle, AddressPickerRef } from "./AddressPicker";
import { useRouter } from "expo-router";

export default function MapScreen() {
  const [region, setRegion] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const pickerRef = useRef<AddressPickerRef>(null);

  const router = useRouter();

  // get current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // add a marker for current user location
      setMarkers([
        {
          id: "me",
          title: "You are here",
          coordinate: {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          },
        },
      ]);
    })();
  }, []);

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

      <TouchableOpacity style={styles.backbtn} onPress={() => router.push("/UserProfile")}>
        <Text style={styles.backbtnText}>Back</Text>
      </TouchableOpacity>
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
    left: 20,
    backgroundColor: "#2563EB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  backbtnText: {
    color: "#fff",
    fontWeight: "600"
  }
});
