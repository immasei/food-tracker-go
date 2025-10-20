import firebaseApp from "../../config/firebaseConfig";
import { getFirestore, doc, updateDoc, serverTimestamp } from "firebase/firestore";

const db = getFirestore(firebaseApp);

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

  await updateDoc(doc(db, "users", userDocId), {
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
