import { View} from "react-native";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { serverTimestamp } from "firebase/firestore";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { updateUser } from "@/services/userService";
import { GOOGLE_KEY } from "@/config/apiKey";

type Props = {
  onPicked: (picked: {
    placeId: string;
    formatted: string;
    lat: number;
    lng: number;
    components: any[];
  }) => void;

  onOpenChange?: (open: boolean) => void;
};

// extract a component by type; choose long or short name
function pick(comp: any[], type: string, long = true) {
  const c = comp?.find((x: any) => (x.types || []).includes(type));
  if (!c) return null;
  return long ? c.long_name ?? null : c.short_name ?? null;
}

export async function savePickedAddress(
  userDocId: string,
  payload: {
    placeId: string;
    formatted: string;
    lat: number;
    lng: number;
    components: any[]; // raw Google address_components array
  }
) {
  const comps = payload.components || [];

  const state = pick(comps, "administrative_area_level_1", false); // ie NSW (short)
  const postcode = pick(comps, "postal_code");
  const suburb =
    pick(comps, "locality") || pick(comps, "postal_town") || pick(comps, "sublocality");
  const country = pick(comps, "country"); // long name (ie Australia)

  await updateUser(userDocId, {
    location: {
      placeId: payload.placeId,
      formatted: payload.formatted,
      lat: payload.lat,
      lng: payload.lng,
      state: state ?? null,
      postcode: postcode ?? null,
      suburb: suburb ?? null,
      country: country ?? null,
      updatedAt: serverTimestamp(),
    },
  });
}


export async function reverseGeocodeWithGoogle(lat: number, lng: number) {
  try {
    // guard + normalize
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.log("Bad coords", { lat, lng, typeLat: typeof lat, typeLng: typeof lng });
      throw new Error("Invalid coordinates for geocoding");
    }
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);

    // Build URL with no spaces and encoded param
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(`${latStr},${lngStr}`)}&key=${encodeURIComponent(GOOGLE_KEY)}`;

    // console.log("GEOCODE URL:", url);

    const res = await fetch(url);
    const text = await res.text(); // read raw to see exact payload on 400
    let data: any = {};
    try { data = JSON.parse(text); } catch {}

    // console.log("GEOCODE HTTP:", res.status, "BODY:", text);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${data?.error_message ?? "Bad request"}`);
    }

    if (data.status !== "OK") {
      console.log("Geocode API status:", data.status, data.error_message);
      return null;
    }

    const first = data.results?.[0];
    if (!first) return null;

    return {
      placeId: first.place_id,
      formatted: first.formatted_address,
      components: first.address_components,
    };
  } catch (e) {
    console.log("reverseGeocodeWithGoogle failed:", e);
    return null;
  }
}

export type AddressPickerRef = { focus: () => void; clear: () => void };

const AddressPicker = forwardRef<AddressPickerRef, Props>(({ onPicked, onOpenChange }, ref) => {
  const innerRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    focus: () => innerRef.current?.focus(),
    clear: () => innerRef.current?.setAddressText(""),
  }));

  return (
    <View
      style={{ position: "relative", zIndex: 9999, elevation: 50}}
      pointerEvents="box-none"
    >
      <GooglePlacesAutocomplete
        ref={innerRef}
        placeholder="Search an Australian address"
        minLength={2}
        enablePoweredByContainer={false}
        keyboardShouldPersistTaps="handled"
        fetchDetails
        predefinedPlaces={[]}
        debounce={200}
        keepResultsAfterBlur={false}
        textInputProps={{
          returnKeyType: "search",
          autoCorrect: false,
          autoCapitalize: "none",
          onFocus: () => onOpenChange?.(true),
          onBlur: () => onOpenChange?.(false),
        }}
        query={{
          key: GOOGLE_KEY,
          language: "en",
          components: "country:au",
        }}
        timeout={10000}
        onPress={(data, details) => {
          if (!details) return;
          const comps = details.address_components || [];
          const lat = details.geometry?.location?.lat ?? null;
          const lng = details.geometry?.location?.lng ?? null;
          const formatted = details.formatted_address ?? data.description ?? "";
          const placeId = details.place_id;

          if (lat != null && lng != null) {
            onPicked({ placeId, formatted, lat, lng, components: comps });
          }
        }}
        styles={{
          container: {
            flex: 0,
            backgroundColor: "transparent",
          },
          textInputContainer: {
            backgroundColor: "transparent",
            padding: 0,
            borderRadius: 12,
          },
          textInput: {
            height: 46,
            borderRadius: 12,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            backgroundColor: "rgba(255, 255, 255, 0.86)",
          },
          listView: {
            position: "absolute",
            top: 46,
            left: 0,
            right: 0,
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            borderRadius: 12,
            zIndex: 10000,
            elevation: 10,
            // nice shadow:
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
          },
          row: {
            paddingVertical: 12,
            backgroundColor: "transparent",
          },
          separator: {
            height: 1,
            backgroundColor: "rgba(0,0,0,0.06)",
          },
          description: {
            color: "#111827",
          },
          poweredContainer: {
            backgroundColor: "transparent",
          },
        }}
      />
    </View>
  );
});

export default AddressPicker;